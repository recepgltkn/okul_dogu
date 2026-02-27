const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

async function assertTeacher(context) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }
  const userSnap = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Kullanıcı bulunamadı.");
  }
  const userData = userSnap.data() || {};
  const role = String(userData.role || "").trim().toLowerCase();
  const isTeacherLike = role === "teacher" || role === "admin" || userData.isTeacher === true;
  if (!isTeacherLike) {
    throw new functions.https.HttpsError("permission-denied", "Yetkisiz işlem.");
  }
}

async function assertStudent(context) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }
  const userSnap = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Kullanıcı bulunamadı.");
  }
  const userData = userSnap.data() || {};
  if (String(userData.role || "student") !== "student") {
    throw new functions.https.HttpsError("permission-denied", "Bu işlem yalnızca öğrenci için kullanılabilir.");
  }
}

exports.deleteUserByAdmin = functions.https.onCall(async (data, context) => {
  await assertTeacher(context);
  const uid = data && data.uid;
  if (!uid || typeof uid !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "uid gerekli.");
  }

  await admin.auth().deleteUser(uid);
  return { ok: true };
});

exports.setUserPasswordByAdmin = functions.https.onCall(async (data, context) => {
  await assertTeacher(context);
  const uid = data && data.uid;
  const newPassword = data && data.newPassword;
  if (!uid || typeof uid !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "uid gerekli.");
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    throw new functions.https.HttpsError("invalid-argument", "Geçersiz şifre.");
  }

  await admin.auth().updateUser(uid, { password: newPassword });
  return { ok: true };
});

exports.studentAiAssistant = functions.https.onCall(async (data, context) => {
  await assertStudent(context);
  const question = String(data?.question || "").trim();
  const contextPayload = data?.context || {};
  if (!question) {
    throw new functions.https.HttpsError("invalid-argument", "question gerekli.");
  }

  const cfg = functions.config() || {};
  const apiKey = String(cfg?.openai?.key || process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return { answer: "" };
  }

  const systemPrompt = [
    "Sen bir okul platformu ogrenci asistansin.",
    "Sadece verilen platform icerigi baglamina dayanarak cevap ver.",
    "Bilmiyorsan acikca bilmiyorum de ve ogrenciyi ilgili bolume yonlendir.",
    "Kisa, net, Turkce cevap ver."
  ].join(" ");

  const userPrompt = JSON.stringify({
    question,
    platformContext: contextPayload
  });

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 260,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("studentAiAssistant openai error:", resp.status, errText);
      throw new functions.https.HttpsError("internal", "AI servisi hatası.");
    }

    const json = await resp.json();
    const answer = String(json?.choices?.[0]?.message?.content || "").trim();
    return { answer: answer || "" };
  } catch (e) {
    console.error("studentAiAssistant exception:", e);
    throw new functions.https.HttpsError("internal", "AI cevabı alınamadı.");
  }
});
