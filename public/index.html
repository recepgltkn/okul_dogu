<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <title>Eğitim Portalı | Tam Sürüm</title>
    <link rel="icon" type="image/png" href="logo.png">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Poppins:wght@300;400&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4a90e2;
            --success: #2ecc71;
            --danger: #e74c3c;
            --warning: #f39c12;
            --bg: #f4f7f6;
            --app-font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        * , *::before, *::after { box-sizing: border-box; }
        html, body { height: 100%; width: 100%; touch-action: pan-x pan-y; }
        html {
            font-size: 85%;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }
        body,
        body :not(code):not(pre):not(kbd):not(samp) {
            font-family: var(--app-font-family) !important;
        }
        body { background: #f2f2f6; margin: 0; overflow-x: hidden; width: 100vw; }
        #app-screen { background: #f2f2f6; border-radius: 16px; padding: 12px; width: 100%; max-width: 100%; overflow-x: hidden; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); align-items: start; }
        #app-screen > .app-header,
        #app-screen > #home-overview-strip,
        #app-screen > #student-stats-bar,
        #app-screen > #teacher-analytics { grid-column: 1 / -1; }
        #app-screen > .card { margin-bottom: 0; min-width: 0; }
        #app-screen > * { min-width: 0; max-width: 100%; }
        .card, .list-item, .student-list-item, .tabs, .filter-bar, .tab-content { min-width: 0; max-width: 100%; }
        .home-overview-strip {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 2px;
        }
        .home-overview-card {
            background: linear-gradient(160deg, #ffffff, #f8fafc);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px 12px;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .home-overview-title {
            font-size: 0.78rem;
            color: #475569;
            margin-bottom: 4px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }
        .home-overview-value {
            font-size: 1.18rem;
            font-weight: 800;
            color: #1d4ed8;
            line-height: 1.1;
        }
        .home-overview-meta {
            margin-top: 3px;
            font-size: 0.72rem;
            color: #64748b;
            text-align: center;
        }
        /* Anasayfa kartlarını esnek tut */
        #tasks-section,
        #activities-section,
        #quiz-section,
        #block-homework-section,
        #compute-homework-section,
        #lessons-section,
        #leaderboard-section,
        #top-students-card {
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        #student-homework-shell,
        #student-apps-shell {
            display: contents;
        }
        .student-shell-head {
            display: none;
        }
        .student-combined-wrap {
            display: none;
        }
        #app-screen.student-view .student-combined-wrap {
            display: flex;
            flex-direction: column;
            min-height: 0;
            flex: 1;
        }
        .student-combined-wrap .tabs {
            margin-top: 10px;
        }
        .student-combined-wrap .tab-content {
            margin-top: 10px;
            min-height: 0;
            overflow: auto;
            flex: 1;
        }
        .student-shell-body {
            display: contents;
        }
        #tasks-section .tab-content,
        #activities-section .tab-content,
        #block-homework-section .tab-content,
        #compute-homework-section .tab-content,
        #lessons-section .tab-content {
            flex: 1;
            min-height: 0;
            overflow: auto;
        }
        /* Kart başlık/tabs hizasını eşitle */
        #activities-section > h3,
        #lessons-section > h3 {
            margin: 0;
        }
        #tasks-section > h3 {
            margin: 0;
        }
        #student-tabs {
            margin-top: 10px;
        }
        #activities-tabs {
            margin-top: 10px;
        }
        /* Öğretmen kartlarında metin/öge sıkışmasını azalt */
        #app-screen.teacher-view #tasks-section,
        #app-screen.teacher-view #activities-section,
        #app-screen.teacher-view #lessons-section {
            gap: 12px;
        }
        #app-screen.teacher-view #tasks-section > h3,
        #app-screen.teacher-view #activities-section > h3,
        #app-screen.teacher-view #lessons-section > h3 {
            margin: 2px 0 0 !important;
            line-height: 1.25;
            letter-spacing: 0.1px;
        }
        #app-screen.teacher-view #teacher-filters,
        #app-screen.teacher-view #activity-filters {
            margin-bottom: 4px;
        }
        #app-screen.teacher-view #teacher-stats,
        #app-screen.teacher-view #activities-teacher-stats,
        #app-screen.teacher-view #lessons-teacher-stats {
            margin-top: 2px !important;
            margin-bottom: 10px !important;
            padding: 12px 14px !important;
            line-height: 1.35;
        }
        #leaderboard-list,
        #top-students-list,
        #quiz-list {
            flex: 1;
            min-height: 0;
            overflow: auto;
        }
        #app-screen.student-view #student-homework-shell,
        #app-screen.student-view #student-apps-shell {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        #app-screen.student-view .student-shell-head {
            display: block;
            margin: 0;
        }
        #app-screen.student-view .student-shell-head h3 {
            margin: 0;
            font-size: 1.06rem;
            text-align: center;
        }
        #app-screen.student-view .student-shell-head p {
            margin: 10px 0 0 0;
            color: #64748b;
            font-size: 0.82rem;
            text-align: center;
        }
        #app-screen.student-view #student-homework-shell .student-shell-body,
        #app-screen.student-view #student-apps-shell .student-shell-body {
            display: none;
        }
        #app-screen.student-view #leaderboard-section {
            height: 520px;
            min-height: 0;
        }
        #teacher-analytics {
            height: 430px;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        #teacher-analytics #stats-content {
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }
        #teacher-analytics #stats-content > .card {
            height: 100%;
            min-height: 0;
            margin-bottom: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        #teacher-analytics .teacher-top-wrap {
            flex: 1;
            min-height: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            align-items: stretch;
        }
        #teacher-analytics .teacher-type-chart {
            height: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
        }
        #teacher-analytics .teacher-main-chart {
            height: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            display: flex;
            align-items: stretch;
            justify-content: stretch;
            align-self: stretch;
        }
        #teacher-analytics .teacher-type-panel,
        #teacher-analytics .teacher-pie-panel {
            width: 100%;
            height: 100%;
            border: 1px solid #dbeafe;
            border-radius: 14px;
            background: linear-gradient(145deg, #ffffff, #f8fbff);
            padding: 6px 10px 12px;
            display: grid;
            grid-template-rows: auto minmax(170px, 1fr);
            gap: 4px;
            align-content: stretch;
        }
        #teacher-analytics .teacher-pie-panel {
            grid-template-rows: auto minmax(170px, 1fr) auto;
        }
        #teacher-analytics .teacher-type-title,
        #teacher-analytics .teacher-pie-title {
            text-align: center;
            font-weight: 500;
            color: #4b5563;
            font-size: 0.94rem;
            line-height: 1.1;
        }
        #teacher-analytics .teacher-type-wrap,
        #teacher-analytics .teacher-pie-wrap {
            min-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-top: 0;
            padding-bottom: 0;
        }
        #teacher-analytics .teacher-type-wrap canvas {
            width: 100% !important;
            height: 100% !important;
            max-height: 220px;
        }
        #teacher-analytics .teacher-pie-wrap canvas {
            width: 100% !important;
            height: 100% !important;
            max-height: 195px;
        }
        #teacher-analytics .teacher-pie-wrap {
            align-items: flex-start;
            padding-top: 48px !important;
            padding-bottom: 12px !important;
        }
        #teacher-analytics #class-chart-summary {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 6px;
            margin-top: 22px !important;
            transform: translateY(8px);
        }
        #teacher-analytics .pie-summary-item {
            border-radius: 10px;
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #e2e8f0;
            background: #fff;
        }
        #teacher-analytics .pie-summary-item.completed { border-color: #86efac; background: #f0fdf4; }
        #teacher-analytics .pie-summary-item.pending { border-color: #fca5a5; background: #fff1f2; }
        #teacher-analytics .pie-summary-item.total { border-color: #bfdbfe; background: #eff6ff; }
        #teacher-analytics .pie-summary-val {
            font-weight: 800;
            font-size: 0.9rem;
            color: #0f172a;
            line-height: 1.1;
        }
        #teacher-analytics .pie-summary-label {
            margin-top: 1px;
            font-size: 0.64rem;
            color: #475569;
            line-height: 1.1;
        }
        #teacher-analytics .teacher-mini-stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }
        #teacher-analytics .teacher-mini-stats-grid .stat-card {
            padding: 6px;
        }
        #teacher-analytics .teacher-mini-stats-grid .stat-number {
            font-size: 1.16rem;
        }
        #teacher-analytics .teacher-mini-stats-grid .stat-label {
            font-size: 0.78rem;
            margin-top: 2px;
        }
        #teacher-analytics .stats-summary-grid {
            margin-bottom: 8px !important;
            gap: 6px !important;
        }
        #teacher-analytics .stats-summary-grid .stat-card {
            padding: 6px;
        }
        #teacher-analytics .stats-summary-grid .stat-number {
            font-size: 1.28rem;
        }
        #teacher-analytics .stats-summary-grid .stat-label {
            font-size: 0.82rem;
            margin-top: 1px;
        }
        #teacher-analytics #stats-content > .card > h4 {
            margin: 0 0 8px 0;
            font-size: 1.18rem;
        }
        #top-students-card {
            position: relative;
            overflow: hidden;
            border: 1px solid #bfdbfe;
            background:
                radial-gradient(circle at top right, rgba(255,255,255,0.95), rgba(219,234,254,0.88)),
                linear-gradient(140deg, #eff6ff, #f8fafc);
        }
        #top-students-card::before {
            content: "";
            position: absolute;
            top: -48px;
            right: -30px;
            width: 150px;
            height: 150px;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 72%);
            pointer-events: none;
        }
        #top-students-card h4 {
            margin-top: 0;
            color: #1e3a8a;
            letter-spacing: 0.2px;
        }
        #top-students-list .top-student-row,
        #leaderboard-list .top-student-row {
            display: grid;
            grid-template-columns: auto auto 1fr auto;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid #dbeafe;
            background: rgba(255,255,255,0.86);
            box-shadow: 0 8px 20px rgba(30, 64, 175, 0.08);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        #top-students-list .top-student-row:hover,
        #leaderboard-list .top-student-row:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(30, 64, 175, 0.16);
        }
        #top-students-list .top-rank-badge,
        #leaderboard-list .top-rank-badge {
            min-width: 34px;
            height: 34px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 0.9rem;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        #top-students-list .top-student-row.rank-1 .top-rank-badge,
        #leaderboard-list .top-student-row.rank-1 .top-rank-badge { background: linear-gradient(135deg, #f59e0b, #d97706); }
        #top-students-list .top-student-row.rank-2 .top-rank-badge,
        #leaderboard-list .top-student-row.rank-2 .top-rank-badge { background: linear-gradient(135deg, #94a3b8, #64748b); }
        #top-students-list .top-student-row.rank-3 .top-rank-badge,
        #leaderboard-list .top-student-row.rank-3 .top-rank-badge { background: linear-gradient(135deg, #f97316, #ea580c); }
        #top-students-list .top-student-name,
        #leaderboard-list .top-student-name {
            font-weight: 700;
            color: #0f172a;
            line-height: 1.2;
        }
        #top-students-list .top-student-meta,
        #leaderboard-list .top-student-meta {
            color: #475569;
            font-size: 0.82rem;
            margin-top: 2px;
        }
        #top-students-list .top-student-xp,
        #leaderboard-list .top-student-xp {
            font-weight: 800;
            color: #047857;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 999px;
            padding: 5px 9px;
            font-size: 0.82rem;
            white-space: nowrap;
        }
        #top-students-list .top-student-avatar,
        #leaderboard-list .top-student-avatar {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            overflow: hidden;
            border: 1px solid #bfdbfe;
            background: #eff6ff;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #top-students-list .top-student-avatar img,
        #leaderboard-list .top-student-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #top-students-list .top-student-medal,
        #leaderboard-list .top-student-medal {
            margin-left: 6px;
            font-size: 0.82rem;
        }
        .container { width: 100%; max-width: 1440px; margin: 12px auto; padding: 12px; overflow-x: hidden; }
        .form-control { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        .btn { padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-success { background: var(--success); color: white; }
        .btn-danger { background: var(--danger); color: white; }
        .btn-warning { background: var(--warning); color: white; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .card { background: white; padding: 14px; border-radius: 12px; box-shadow: 0 3px 6px rgba(0,0,0,0.08); margin-bottom: 12px; }
        
        .sidebar { height: 100%; width: 0; position: fixed; z-index: 1000; top: 0; left: 0; background: #ffffff; border-right: 1px solid #e5e7eb; box-shadow: 10px 0 32px rgba(15,23,42,0.12); overflow-x: hidden; overflow-y: auto; transition: 0.5s; padding-top: 20px; display: flex; flex-direction: column; }
        .sidebar button { padding: 15px; font-size: 18px; color: #334155; display: block; background: none; border: none; width: 100%; text-align: left; cursor: pointer; }
        .sidebar button:hover { color: #0f172a; background: #f8fafc; }
        .sidebar button.active { color: #1d4ed8; background: #eaf2ff; }
        .sidebar-logo-wrap { display:flex; justify-content:center; align-items:center; padding: 2px 0 10px; }
        .sidebar-logo { width: 93px; height: auto; border-radius: 10px; border:1px solid #dbe5f1; background:#fff; }
        .sidebar-group-toggle {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            font-weight: 400;
            color: #1f2937 !important;
            border-top: 1px solid #eef2f7;
            margin-top: 4px;
            padding-top: 13px !important;
            padding-bottom: 13px !important;
        }
        .sidebar-group-toggle .arrow { font-size: 12px; opacity: 0.9; }
        .sidebar-submenu { display: none; padding: 0 0 6px; }
        .sidebar-submenu.open { display: block; }
        .sidebar-submenu .submenu-item {
            padding-left: 28px !important;
            font-size: 16px !important;
            color: #475569 !important;
        }
        .sidebar-submenu .submenu-item:hover { color: #0f172a !important; background: #f8fafc; }
        .sidebar-footer {
            margin-top: auto;
            padding: 10px 12px 14px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .sidebar-footer-title {
            font-size: 0.78rem;
            color: #64748b;
            text-align: center;
            font-weight: 500;
        }
        .sidebar-footer #student-total-time {
            width: 100%;
            justify-content: center;
        }
        #side-menu.student-minimal #btn-toggle-tasks-menu,
        #side-menu.student-minimal #btn-toggle-add-menu,
        #side-menu.student-minimal #btn-toggle-apps-menu,
        #side-menu.student-minimal #btn-toggle-student-data-menu,
        #side-menu.student-minimal #btn-open-lessons,
        #side-menu.student-minimal #btn-open-create,
        #side-menu.student-minimal #btn-open-tasks,
        #side-menu.student-minimal #btn-open-approvals,
        #side-menu.student-minimal #btn-open-content,
        #side-menu.student-minimal #btn-open-books,
        #side-menu.student-minimal #btn-open-add-student,
        #side-menu.student-minimal #btn-open-students,
        #side-menu.student-minimal #btn-open-classes,
        #side-menu.student-minimal #btn-open-reports,
        #side-menu.student-minimal #btn-open-login-cards,
        #side-menu.student-minimal #btn-open-teacher-certificates,
        #side-menu.student-minimal #btn-open-block-runner-menu,
        #side-menu.student-minimal #btn-open-block-3d-menu,
        #side-menu.student-minimal #btn-open-compute-it-menu,
        #side-menu.student-minimal #btn-open-flowchart-app,
        #side-menu.student-minimal #btn-open-live-quiz,
        #side-menu.student-minimal #submenu-tasks,
        #side-menu.student-minimal #submenu-add,
        #side-menu.student-minimal #submenu-apps,
        #side-menu.student-minimal #submenu-student-data {
            display: none !important;
        }
        #side-menu.student-minimal #btn-open-home,
        #side-menu.student-minimal #btn-open-my-stats,
        #side-menu.student-minimal #btn-open-certificates,
        #side-menu.student-minimal #btn-logout-side {
            display: block !important;
        }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        #student-detail-modal { z-index: 14000; }
        #confirm-modal { z-index: 26000 !important; }
        #info-modal { z-index: 26001 !important; }
        #task-students-modal { z-index: 12000; }
        .modal-content { background: white; padding: 25px; border-radius: 15px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-large { max-width: 1020px; }
        #task-modal .modal-content {
            width: 95vw;
            max-width: 1200px;
            max-height: 92vh;
        }
        #content-modal .modal-content {
            width: 96vw;
            max-width: 1320px;
            max-height: 92vh;
        }
        #students-modal .modal-content { max-width: 1320px; width: 98vw; }
        #students-modal .student-row {
            display: flex;
            flex-wrap: nowrap;
            gap: 8px;
            align-items: center;
            overflow-x: auto;
            padding-bottom: 2px;
        }
        #students-modal .student-input { flex: 0 0 140px; min-width: 110px; }
        #students-modal .student-input.input-first { flex-basis: 140px; }
        #students-modal .student-input.input-last { flex-basis: 140px; }
        #students-modal .student-input.input-username { flex-basis: 170px; }
        #students-modal .student-input.input-pass { flex-basis: 150px; }
        #students-modal .student-input.input-class { flex-basis: 90px; }
        #students-modal .student-input.input-section { flex-basis: 80px; }
        #students-modal .student-actions { display: flex; gap: 6px; flex-wrap: nowrap; margin-left: auto; flex: 0 0 auto; }
        #students-modal .student-actions .btn { padding: 6px 10px; font-size: 0.85rem; }
        #flowchart-modal {
            z-index: 25011;
            align-items: stretch;
            justify-content: stretch;
            padding: 0;
        }
        #flowchart-modal .modal-content.flowchart-shell {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: none;
            margin: 0;
            padding: 0;
            border-radius: 0;
            border: 1px solid #b5b5b5;
            background: #dcdcdc;
            display: grid;
            grid-template-rows: 56px 1fr;
            overflow: hidden;
        }
        .flowchart-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-bottom: 1px solid #bfbfbf;
            background: #e7e7e7;
        }
        .flowchart-assignment-timer {
            margin-left: auto;
            border: 1px solid #a8a8a8;
            background: #f8fafc;
            color: #0f172a;
            border-radius: 6px;
            padding: 7px 10px;
            font-weight: 700;
            min-width: 120px;
            text-align: center;
        }
        .flowchart-btn {
            border: 1px solid #a8a8a8;
            background: #f5f5f5;
            color: #1f2937;
            border-radius: 4px;
            padding: 7px 10px;
            font-weight: 700;
            cursor: pointer;
        }
        .flowchart-btn.active {
            border-color: #2563eb;
            background: #dbeafe;
            color: #1d4ed8;
        }
        .flowchart-btn.run {
            border-color: #059669;
            background: #10b981;
            color: #fff;
        }
        .flowchart-btn.stop {
            border-color: #dc2626;
            background: #ef4444;
            color: #fff;
        }
        .flowchart-main {
            min-height: 0;
            display: grid;
            grid-template-columns: 130px 1fr 340px;
            gap: 0;
        }
        .flowchart-palette {
            border-right: 1px solid #bfbfbf;
            background: #ececec;
            padding: 10px 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .flowchart-tool {
            border: 1px solid #9ca3af;
            background: #fafafa;
            border-radius: 4px;
            height: 56px;
            display: grid;
            place-items: center;
            cursor: pointer;
            font-weight: 700;
            color: #1f2937;
            padding: 4px;
            overflow: hidden;
        }
        .flowchart-tool.active {
            border-color: #2563eb;
            box-shadow: inset 0 0 0 2px rgba(37, 99, 235, 0.22);
            background: #eff6ff;
        }
        .flow-tool-shape {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 34px;
            border: 2px solid #111827;
            color: #111827;
            background: #fff;
            font-weight: 700;
            font-size: 0.86rem;
            user-select: none;
        }
        .flow-tool-shape.start,
        .flow-tool-shape.end {
            border-radius: 999px;
        }
        .flow-tool-shape.input,
        .flow-tool-shape.output {
            clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
        }
        .flow-tool-shape.decision {
            width: 42px;
            height: 42px;
            transform: rotate(45deg);
            padding: 0;
        }
        .flow-tool-shape.decision > span {
            transform: rotate(-45deg);
            display: inline-block;
            font-size: 0.74rem;
        }
        .flowchart-canvas-wrap {
            position: relative;
            background: #ddd;
            overflow: auto;
        }
        #flowchart-canvas {
            position: relative;
            min-width: 1200px;
            min-height: 900px;
            background: #dedede;
        }
        #flowchart-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: auto;
        }
        .flow-node {
            position: absolute;
            min-width: 130px;
            max-width: 240px;
            min-height: 50px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 2px solid #1f2937;
            background: #fff;
            color: #111827;
            font-weight: 700;
            user-select: none;
            cursor: move;
            white-space: pre-line;
        }
        .flow-node.selected { box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3); }
        .flow-node.connect-source { box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.45); }
        .flow-node.running { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.45); }
        .flow-node.start, .flow-node.end { border-radius: 999px; }
        .flow-node.input, .flow-node.output {
            clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
            padding-left: 18px;
            padding-right: 18px;
        }
        .flow-node.decision {
            width: 130px;
            height: 130px;
            min-width: 130px;
            min-height: 130px;
            transform: rotate(45deg);
            padding: 0;
        }
        .flow-node.decision > span {
            transform: rotate(-45deg);
            width: 90px;
            display: inline-block;
        }
        .flowchart-right {
            border-left: 1px solid #bfbfbf;
            background: #f3f4f6;
            display: grid;
            grid-template-rows: auto auto 1fr;
        }
        .flowchart-right-head {
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
            font-weight: 800;
            color: #111827;
        }
        .flowchart-help {
            padding: 8px 10px;
            border-bottom: 1px solid #d1d5db;
            color: #4b5563;
            font-size: 0.82rem;
            line-height: 1.4;
        }
        .flow-target-mini {
            width: 100%;
            min-height: 120px;
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            overflow: auto;
        }
        #flowchart-output {
            margin: 0;
            padding: 10px;
            background: #000;
            color: #fff;
            overflow: auto;
            font-family: Consolas, "Courier New", monospace;
            font-size: 13px;
            line-height: 1.42;
            white-space: pre-wrap;
        }
        body.dark-mode #flowchart-modal .modal-content.flowchart-shell {
            background: #0f172a;
            border-color: #334155;
        }
        body.dark-mode .flowchart-toolbar {
            background: #111827;
            border-bottom-color: #1f2937;
            color: #e5e7eb;
        }
        body.dark-mode .flowchart-palette {
            background: #0f172a;
            border-right-color: #1f2937;
        }
        body.dark-mode .flowchart-tool {
            background: #111827;
            color: #e5e7eb;
            border-color: #334155;
        }
        body.dark-mode .flow-tool-shape {
            border-color: #93c5fd;
            color: #e5e7eb;
            background: #1e293b;
        }
        body.dark-mode .flowchart-canvas-wrap,
        body.dark-mode #flowchart-canvas { background: #111827; }
        body.dark-mode .flow-node {
            border-color: #93c5fd;
            background: #1e293b;
            color: #e5e7eb;
        }
        body.dark-mode .flowchart-right {
            background: #0f172a;
            border-left-color: #1f2937;
        }
        body.dark-mode .flowchart-right-head,
        body.dark-mode .flowchart-help {
            color: #e5e7eb;
            border-bottom-color: #1f2937;
        }
        body.dark-mode .flow-target-mini {
            background: #111827;
            border-color: #334155;
        }
        #flow-node-editor-modal .modal-content { max-width: 520px; }
        .flow-node-editor-form { display: grid; gap: 10px; }
        .flow-node-editor-row { display: grid; gap: 8px; grid-template-columns: 1fr 1fr; }
        .flow-node-editor-row.three { grid-template-columns: 1fr auto 1fr; align-items: end; }
        .flow-node-editor-label { font-size: 0.84rem; color: #4b5563; font-weight: 600; margin-bottom: 4px; }
        #flow-runtime-input-modal .modal-content { max-width: 430px; }
        body.dark-mode .flow-node-editor-label { color: #cbd5e1; }
        .confirm-shell {
            max-width: 440px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background:
                radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.2), rgba(255,255,255,0) 36%),
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.16), rgba(255,255,255,0) 36%),
                linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 28px 56px rgba(15, 23, 42, 0.28);
            animation: confirmPopIn 180ms ease-out;
        }
        .confirm-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .confirm-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            box-shadow: 0 8px 18px rgba(239, 68, 68, 0.22);
        }
        .confirm-title {
            margin: 0;
            font-size: 1.08rem;
            letter-spacing: 0.2px;
        }
        .confirm-message {
            margin-bottom: 16px;
            color: #374151;
            line-height: 1.4;
        }
        .confirm-actions {
            display: flex;
            gap: 10px;
        }
        .confirm-actions .btn {
            border-radius: 12px;
            transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
        }
        .confirm-actions .btn:hover {
            transform: translateY(-1px);
            filter: brightness(1.02);
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.16);
        }
        .info-shell {
            max-width: 460px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background:
                radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.16), rgba(255,255,255,0) 42%),
                radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.14), rgba(255,255,255,0) 40%),
                linear-gradient(150deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 24px 50px rgba(15, 23, 42, 0.24);
        }
        #btn-info-continue.btn-continue-play {
            border: 1px solid #f59e0b;
            background: linear-gradient(135deg, #f59e0b, #ea580c) !important;
            color: #fff !important;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 10px 18px rgba(234, 88, 12, 0.28);
        }
        #btn-info-continue.btn-continue-play:hover {
            transform: translateY(-1px);
            filter: brightness(1.03);
            box-shadow: 0 14px 22px rgba(234, 88, 12, 0.34);
        }
        #btn-info-continue.btn-continue-play .play-ico {
            font-size: 1rem;
            line-height: 1;
        }
        .completion-info-card {
            border: 1px solid #dbeafe;
            background: linear-gradient(135deg, #f8fbff 0%, #eef8ff 100%);
            border-radius: 14px;
            padding: 12px;
            margin-bottom: 12px;
        }
        .completion-info-title {
            font-size: 0.96rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
        }
        .completion-info-subtitle {
            font-size: 0.88rem;
            color: #0f766e;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .completion-info-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
        }
        .completion-info-item {
            background: #ffffff;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            padding: 8px;
            text-align: center;
        }
        .completion-info-item .k {
            font-size: 0.72rem;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 2px;
        }
        .completion-info-item .v {
            font-size: 0.88rem;
            color: #0f172a;
            font-weight: 800;
        }
        .homework-assign-shell {
            max-width: 600px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background:
                radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.12), rgba(255,255,255,0) 42%),
                radial-gradient(circle at 100% 0%, rgba(20, 184, 166, 0.11), rgba(255,255,255,0) 40%),
                linear-gradient(150deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 22px 45px rgba(15, 23, 42, 0.2);
        }
        .homework-assign-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
            padding: 10px 12px;
            border-radius: 12px;
            background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 52%, #ecfeff 100%);
            border: 1px solid #bfdbfe;
        }
        .homework-assign-head h3 {
            font-size: 1.05rem;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.2px;
        }
        .homework-assign-close {
            background: #e2e8f0 !important;
            color: #334155 !important;
            border: 1px solid #cbd5e1 !important;
        }
        .homework-assign-save {
            background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%) !important;
            color: #fff !important;
            border: 1px solid #1d4ed8 !important;
            font-weight: 700;
        }
        .homework-assign-save:hover {
            transform: translateY(-1px);
            filter: brightness(1.03);
            box-shadow: 0 10px 20px rgba(37, 99, 235, 0.24);
        }
        .homework-assign-delete {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
            color: #fff !important;
            border: 1px solid #b91c1c !important;
            font-weight: 700;
        }
        .homework-assign-hint {
            display: block;
            color: #475569;
            margin: 4px 0 12px;
            font-size: 0.83rem;
            background: #f1f5f9;
            border: 1px dashed #cbd5e1;
            border-radius: 10px;
            padding: 8px 10px;
        }
        .homework-assign-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        .homework-assign-actions .btn {
            min-width: 170px;
        }
        @keyframes confirmPopIn {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        body.dark-mode .confirm-shell {
            border-color: #334155;
            background:
                radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.22), rgba(2,6,23,0) 34%),
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.2), rgba(2,6,23,0) 34%),
                linear-gradient(150deg, #0f172a 0%, #111827 100%);
        }
        body.dark-mode .confirm-title { color: #e5e7eb; }
        body.dark-mode .confirm-message { color: #cbd5e1; }
        body.dark-mode .confirm-icon {
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(190, 24, 93, 0.25));
            color: #fecaca;
        }
        body.dark-mode .info-shell {
            border-color: #334155;
            background:
                radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.2), rgba(2,6,23,0) 42%),
                radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.18), rgba(2,6,23,0) 40%),
                linear-gradient(150deg, #0f172a 0%, #111827 100%);
            box-shadow: 0 24px 50px rgba(2, 6, 23, 0.5);
        }
        body.dark-mode .completion-info-card {
            border-color: #1e3a8a;
            background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
        }
        body.dark-mode .completion-info-title { color: #e2e8f0; }
        body.dark-mode .completion-info-subtitle { color: #67e8f9; }
        body.dark-mode .completion-info-item {
            background: #0b1220;
            border-color: #1e3a8a;
        }
        body.dark-mode .completion-info-item .k { color: #94a3b8; }
        body.dark-mode .completion-info-item .v { color: #e2e8f0; }
        body.dark-mode .homework-assign-shell {
            border-color: #334155;
            background:
                radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.2), rgba(2,6,23,0) 42%),
                radial-gradient(circle at 100% 0%, rgba(20, 184, 166, 0.16), rgba(2,6,23,0) 40%),
                linear-gradient(150deg, #0f172a 0%, #111827 100%);
            box-shadow: 0 24px 46px rgba(2, 6, 23, 0.55);
        }
        body.dark-mode .homework-assign-head {
            background: linear-gradient(135deg, rgba(30,58,138,0.45) 0%, rgba(3,105,161,0.35) 100%);
            border-color: #1d4ed8;
        }
        body.dark-mode .homework-assign-head h3 { color: #e2e8f0; }
        body.dark-mode .homework-assign-close {
            background: #1f2937 !important;
            color: #e2e8f0 !important;
            border-color: #334155 !important;
        }
        body.dark-mode .homework-assign-hint {
            color: #cbd5e1;
            background: #0b1220;
            border-color: #334155;
        }
        @media (max-width: 540px) {
            .completion-info-grid { grid-template-columns: 1fr; }
        }
        .list-item { background: white; padding: 10px 12px; margin-bottom: 8px; border-radius: 10px; border-left: 4px solid var(--primary); cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
        #reports-list .list-item:hover { transform: none; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        #reports-list .list-item { padding: 6px 8px; font-size: 0.9rem; }
        #reports-list .list-item small { font-size: 0.75rem; }
        .list-item.completed { border-left-color: var(--success); background: #f0fff4; opacity: 0.85; cursor: default; }
        .list-item.completed:hover { transform: none; box-shadow: none; }
        .list-item.expired { border-left-color: var(--danger); opacity: 0.7; }
        
        .tabs { display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 2px solid #eee; }
        .tab-btn { flex: 1; padding: 12px; border: none; background: none; cursor: pointer; font-weight: bold; color: #666; border-bottom: 3px solid transparent; transition: 0.3s; }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
        #student-tabs,
        #activities-tabs,
        #block-homework-tabs,
        #compute-homework-tabs,
        #lessons-tabs {
            margin-top: 10px !important;
            margin-bottom: 15px;
            align-items: stretch;
        }
        #student-tabs .tab-btn,
        #activities-tabs .tab-btn,
        #block-homework-tabs .tab-btn,
        #compute-homework-tabs .tab-btn,
        #lessons-tabs .tab-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 42px;
            padding: 0 12px;
            line-height: 1;
            box-sizing: border-box;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .home-tabs { display:none !important; }
        .home-tab-btn { display:none !important; }
        
        .filter-bar { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
        .filter-btn { padding: 8px 15px; border: 1px solid #ddd; background: white; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: 0.3s; }
        .filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        
        .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; position: relative; min-height: 44px; }
        #app-screen.student-view .app-header { display: grid; grid-template-columns: 1fr auto auto; align-items: center; column-gap: 8px; }
        #app-screen.student-view #student-total-time { justify-self: start; order: 1; }
        #app-screen.student-view #user-fullname { display: none; }
        #app-screen.student-view #theme-toggle-app { justify-self: end; order: 2; }
        #app-screen.student-view #user-menu { justify-self: end; order: 3; }
        #app-screen.student-view #user-welcome { display: none; }
        #app-screen.teacher-view .app-header { justify-content: flex-end; gap: 8px; }
        #app-screen.teacher-view #user-fullname { display: none; }
        #app-screen.teacher-view #user-welcome { margin-right: 4px; }
        #user-header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            background: radial-gradient(circle at 30% 30%, #fef3c7, #f59e0b);
            overflow: hidden;
            cursor: pointer;
        }
        #user-header-avatar.visible { display: inline-flex; }
        #user-header-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        #user-menu-trigger {
            padding: 8px 12px;
            border-radius: 999px;
            border: 1px solid #d1d5db;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        #user-menu-trigger:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(0,0,0,0.12);
        }
        #app-screen.teacher-view #user-menu-trigger {
            background: linear-gradient(135deg, #dbeafe, #e9d5ff);
            border-color: #c4b5fd;
            color: #312e81;
        }
        #app-screen.student-view #user-menu-trigger {
            background: linear-gradient(135deg, #dcfce7, #d1fae5);
            border-color: #86efac;
            color: #14532d;
        }
        .time-widget {
            display: inline-flex;
            gap: 6px;
            align-items: center;
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            border: 1px solid #dbe4ef;
            border-radius: 999px;
            padding: 5px 8px;
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
            max-width: 100%;
            flex-wrap: wrap;
        }
        .time-block {
            display: inline-flex;
            align-items: baseline;
            gap: 3px;
            min-width: 0;
            padding: 2px 6px;
            border-radius: 999px;
            background: #eef2ff;
            border: 1px solid #dbeafe;
        }
        .time-val { font-weight: 500; color: #1d4ed8; font-size: 0.84rem; line-height: 1; }
        .time-label { font-size: 0.68rem; color: #475569; letter-spacing: 0; text-transform: none; font-weight: 400; }
        .avatar-shop-modal-content {
            width: min(980px, 94vw);
            max-height: 88vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 12px;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background:
                radial-gradient(circle at 12% 6%, rgba(34, 197, 94, 0.2), rgba(255,255,255,0) 30%),
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.18), rgba(255,255,255,0) 36%),
                linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 28px 60px rgba(15, 23, 42, 0.28);
        }
        .avatar-shop-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            padding: 2px 2px 6px;
        }
        .avatar-shop-xp {
            background: #ecfdf5;
            border: 1px solid #86efac;
            color: #166534;
            font-weight: 700;
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 0.92rem;
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.22);
        }
        .avatar-shop-grid {
            overflow: auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
            padding-right: 2px;
            padding-bottom: 6px;
        }
        .avatar-card {
            background: linear-gradient(160deg, #ffffff, #f8fafc);
            border: 1px solid #dbe7f5;
            border-radius: 14px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
            transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .avatar-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 30px rgba(15, 23, 42, 0.15);
        }
        .avatar-card.owned { border-color: #86efac; background: #f0fdf4; }
        .avatar-card.selected {
            border-color: #34d399;
            box-shadow: 0 10px 24px rgba(16, 185, 129, 0.22);
        }
        .avatar-icon {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            margin: 0 auto;
            font-size: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(255,255,255,0.9);
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
        }
        .avatar-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            transform: scale(1.03);
        }
        .avatar-card h4 {
            margin: 0;
            font-size: 0.95rem;
            text-align: center;
        }
        .avatar-cost {
            text-align: center;
            color: #475569;
            font-size: 0.84rem;
            font-weight: 600;
        }
        .edu-ai-fab {
            position: fixed;
            right: 18px;
            bottom: 18px;
            width: 78px;
            height: 78px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.7);
            background:
                radial-gradient(circle at 30% 22%, rgba(255,255,255,0.95), rgba(255,255,255,0) 42%),
                linear-gradient(145deg, #34d399, #3b82f6 58%, #2563eb);
            color: #fff;
            box-shadow: 0 20px 42px rgba(15, 23, 42, 0.3), inset 0 -8px 14px rgba(37, 99, 235, 0.35);
            cursor: pointer;
            z-index: 21020;
            display: none;
            padding: 0;
            overflow: visible;
            backdrop-filter: blur(6px);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .edu-ai-fab::before {
            content: "";
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid rgba(147, 197, 253, 0.45);
            animation: aiGlowPulse 1.8s ease-in-out infinite;
            z-index: 0;
        }
        .edu-ai-fab:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 26px 52px rgba(15, 23, 42, 0.34), inset 0 -8px 14px rgba(37, 99, 235, 0.45);
        }
        .edu-ai-core {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 52px;
            height: 52px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.95);
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(2, 6, 23, 0.28), inset 0 0 0 1px rgba(255,255,255,0.6);
            z-index: 3;
            background: #fff;
        }
        .edu-ai-core img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transform: scale(1.04);
        }
        .edu-ai-wing {
            position: absolute;
            top: 50%;
            width: 32px;
            height: 40px;
            border-radius: 70% 30% 70% 25%;
            background:
                linear-gradient(180deg, #ffffff 0%, #f1f5f9 62%, #dbeafe 100%);
            border: 1px solid #cbd5e1;
            box-shadow: 0 10px 16px rgba(15, 23, 42, 0.2);
            z-index: 1;
            transform-origin: center;
        }
        .edu-ai-wing.left {
            left: -15px;
            transform: translateY(-50%) rotate(-16deg);
            animation: aiWingLeft 2.1s ease-in-out infinite;
        }
        .edu-ai-wing.right {
            right: -15px;
            transform: translateY(-50%) rotate(16deg) scaleX(-1);
            animation: aiWingRight 2.1s ease-in-out infinite;
        }
        @keyframes aiGlowPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50% { opacity: 0.15; transform: scale(1.08); }
        }
        @keyframes aiWingLeft {
            0%, 100% { transform: translateY(-50%) rotate(-16deg); }
            50% { transform: translateY(-50%) rotate(-7deg); }
        }
        @keyframes aiWingRight {
            0%, 100% { transform: translateY(-50%) rotate(16deg) scaleX(-1); }
            50% { transform: translateY(-50%) rotate(7deg) scaleX(-1); }
        }
        .edu-ai-panel {
            position: fixed;
            right: 18px;
            bottom: 94px;
            width: min(430px, calc(100vw - 24px));
            height: min(560px, calc(100vh - 140px));
            border-radius: 16px;
            border: 1px solid #d1d5db;
            background: #ffffff;
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24);
            z-index: 21021;
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        .edu-ai-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 12px 14px;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #dcfce7, #dbeafe);
        }
        .edu-ai-panel-title {
            margin: 0;
            font-size: 0.98rem;
            font-weight: 800;
            color: #1f2937;
        }
        .edu-ai-panel-sub {
            margin: 2px 0 0;
            font-size: 0.78rem;
            color: #334155;
        }
        .edu-ai-close {
            border: 1px solid #cbd5e1;
            background: #fff;
            color: #1f2937;
            border-radius: 10px;
            width: 34px;
            height: 34px;
            cursor: pointer;
            font-size: 18px;
        }
        .edu-ai-messages {
            flex: 1;
            overflow: auto;
            padding: 12px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .edu-ai-msg {
            max-width: 88%;
            border-radius: 12px;
            padding: 8px 10px;
            font-size: 0.88rem;
            line-height: 1.4;
            white-space: pre-wrap;
        }
        .edu-ai-msg.user {
            align-self: flex-end;
            background: #dbeafe;
            color: #1e3a8a;
            border: 1px solid #bfdbfe;
        }
        .edu-ai-msg.bot {
            align-self: flex-start;
            background: #ecfeff;
            color: #0f172a;
            border: 1px solid #bae6fd;
        }
        .edu-ai-input-wrap {
            border-top: 1px solid #e5e7eb;
            background: #ffffff;
            padding: 10px;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
        }
        .edu-ai-input {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 10px;
            font-size: 0.9rem;
            outline: none;
        }
        .edu-ai-input:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .edu-ai-send {
            border: 1px solid #16a34a;
            border-radius: 10px;
            background: #22c55e;
            color: #fff;
            font-weight: 700;
            padding: 0 14px;
            cursor: pointer;
        }
        .edu-ai-quick {
            border-top: 1px dashed #cbd5e1;
            padding: 8px 10px;
            background: #f8fafc;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .edu-ai-quick button {
            border: 1px solid #cbd5e1;
            border-radius: 999px;
            background: #fff;
            color: #334155;
            font-size: 0.76rem;
            padding: 4px 9px;
            cursor: pointer;
        }
        
        .game-question { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 15px; }
        .game-option { display: block; width: 100%; padding: 12px; margin-bottom: 8px; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: left; }
        .game-option:hover { border-color: var(--primary); background: #f0f7ff; }
        .game-option.correct { border-color: var(--success); background: #d4edda; }
        .game-option.wrong { border-color: var(--danger); background: #f8d7da; }
        .progress-bar { width: 100%; height: 8px; background: #eee; border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s; }
        
        .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-info { background: #cce5ff; color: #004085; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-progress { background: #dbeafe; color: #1d4ed8; }
        .badge-mid { background: #ffedd5; color: #9a3412; }
        
        .edit-section { background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 15px; border: 1px solid #dee2e6; }
        .question-edit-item { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ddd; }
        
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .stat-card { background: white; padding: 10px; border-radius: 10px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
        .stats-summary-grid .stat-card { min-width: 0; }
        .stat-number { font-size: 1.5rem; font-weight: bold; color: var(--primary); }
        .stat-label { color: #666; font-size: 0.82rem; margin-top: 4px; }
        
        .student-list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: white; margin-bottom: 8px; border-radius: 10px; cursor: pointer; transition: 0.3s; border-left: 4px solid var(--primary); font-size: 0.9rem; }
        .student-list-item:hover { background: #f0f7ff; transform: translateX(3px); }
        #task-students-list .student-list-item { padding: 8px 10px; margin-bottom: 6px; }
        #task-students-list .student-list-item:hover { transform: none; }
        #task-students-list .student-list-item small { font-size: 0.75rem; }
        .chart-container { position: relative; height: 200px; margin: 10px 0; }
        .stat-detail-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-detail-item { background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; }
        .stat-detail-value { font-size: 1.5rem; font-weight: bold; color: var(--primary); }
        .stat-detail-label { color: #666; font-size: 0.85rem; margin-top: 5px; }

        .content-layout { display: grid; grid-template-columns: 280px 1fr; gap: 12px; }
        .content-left { background: #f8f9ff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px; max-height: 75vh; overflow: auto; }
        .content-right { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 0; height: 100%; overflow: hidden; width: 100%; display: flex; flex-direction: column; }
        .content-viewer-wrap { height: 100%; width: 100%; display: grid; grid-template-columns: 300px 1fr; gap: 12px; }
        .content-left-pane { display: block; overflow: auto; max-height: 100%; padding: 12px; }
        .content-right-pane { height: 100%; width: 100%; display: flex; flex-direction: column; min-width: 0; }
        .app-workspace { border: 0; border-radius: 0; overflow: hidden; background: #fff; display: flex; flex-direction: column; width: 100%; height: 100%; }
        .app-topbar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .app-topbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; }
        .app-title { font-weight: 700; }
        .app-link { font-size: 12px; color: #6b7280; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .app-timer { font-size: 12px; color: #374151; background: #eef2ff; padding: 4px 8px; border-radius: 999px; }
        .app-topbar-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .app-btn { border: none; border-radius: 8px; padding: 6px 10px; font-weight: 600; cursor: pointer; }
        .app-btn.primary { background: #2563eb; color: #fff; }
        .app-btn.warn { background: #f59e0b; color: #fff; }
        .app-btn.danger { background: #dc2626; color: #fff; }
        .app-frame-area { flex: 1; min-height: 0; background: #fff; }
        .app-frame-area iframe { width: 100%; height: 100%; border: 0; }
        .app-workspace.fullscreen { position: fixed; inset: 0; z-index: 4000; border-radius: 0; background: #fff; }
        .app-workspace.fullscreen .app-frame-area { height: 100vh; }
        .activity-layout { display: grid; grid-template-columns: 300px 1fr; gap: 12px; height: 100%; }
        .activity-left { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #f8fafc; display: flex; flex-direction: column; gap: 10px; }
        .activity-title { font-weight: 700; font-size: 18px; }
        .activity-link { font-size: 12px; color: #6b7280; word-break: break-all; }
        .activity-timer { font-size: 12px; color: #374151; background: #eef2ff; padding: 6px 8px; border-radius: 999px; display: inline-block; }
        .activity-actions { display: flex; flex-direction: column; gap: 8px; }
        .activity-right { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; height: 100%; position: relative; }
        .activity-right iframe { width: 100%; height: 100%; border: 0; }
        .activity-frame-status {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            background: rgba(219, 234, 254, 0.94);
            border: 1px solid #93c5fd;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.15);
            display: none;
            max-width: min(92%, 640px);
            text-align: center;
            pointer-events: none;
        }
        .activity-frame-status.warn {
            color: #7c2d12;
            background: rgba(254, 243, 199, 0.95);
            border-color: #fcd34d;
        }
        .activity-frame-status.error {
            color: #7f1d1d;
            background: rgba(254, 226, 226, 0.95);
            border-color: #fca5a5;
        }
        #activity-modal .activity-layout { flex: 1; min-height: 0; }
        #activity-modal .activity-right { min-height: 0; }
        .activity-header-actions { display: none; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .activity-header-actions .app-btn { padding: 7px 10px; }
        #block-runner-timer { min-width: 120px; text-align: center; }
        #activity-modal.block-runner-mode .activity-layout { grid-template-columns: 1fr; }
        #activity-modal.block-runner-mode .activity-left { display: none; }
        #activity-modal.block-runner-mode .activity-header-actions { display: flex; }
        #activity-modal.teacher-block-runner .activity-header-actions { display: flex !important; }
        #activity-modal.block-runner-mode #btn-activity-exit { display: none !important; }
        #activity-modal.block-runner-mode { background: rgba(2, 6, 23, 0.96); }
        #activity-modal.block-runner-mode .modal-content {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            padding: 10px 12px !important;
            margin: 0 !important;
        }
        #activity-modal.block-runner-mode .modal-header { margin-bottom: 8px !important; }
        #activity-modal.block-runner-mode #btn-close-activity {
            width: 36px;
            height: 36px;
            padding: 0;
            border-radius: 999px;
            background: #fee2e2 !important;
            color: #b91c1c;
            font-size: 20px;
            line-height: 1;
            font-weight: 700;
        }
        .activity-fullbar { display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 5000; background: #e9f0ff; color: #111827; padding: 8px 12px; gap: 10px; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .activity-fullbar .left { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .activity-fullbar .right { display: flex; gap: 8px; align-items: center; }
        .activity-fullbar .btn { background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 6px 10px; font-weight: 600; }
        .activity-fullbar .btn.exit { background: #dc2626; }
        .activity-fullbar .btn.exit.line-trace-close-btn {
            width: 36px;
            height: 36px;
            padding: 0;
            border-radius: 999px;
            font-size: 20px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #ef4444, #dc2626);
            box-shadow: 0 8px 16px rgba(127, 29, 29, 0.35);
        }
        .app-btn.paused, .activity-fullbar .btn.paused { background: #f97316 !important; color: #fff !important; }
        .activity-right.paused #activity-iframe { filter: blur(3px); }
        .activity-right.paused { position: relative; }
        .activity-right.paused .activity-pause-overlay { display: flex; }
        .activity-pause-overlay { display: none; position: absolute; inset: 0; background: rgba(15, 23, 42, 0.35); align-items: center; justify-content: center; z-index: 10; }
        .activity-pause-card { background: #fff; padding: 16px 18px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .activity-pause-card .btn { background: #2563eb; color: #fff; border: none; border-radius: 10px; padding: 8px 16px; font-weight: 600; }
        #activity-modal.block-runner-mode .activity-pause-card {
            border-radius: 999px;
            padding: 20px;
            width: 120px;
            height: 120px;
            justify-content: center;
            gap: 6px;
            background: rgba(255,255,255,0.96);
        }
        #activity-modal.block-runner-mode .activity-pause-card .btn {
            width: 84px;
            height: 84px;
            border-radius: 999px;
            padding: 0;
            font-size: 34px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f59e0b, #ea580c) !important;
            color: #fff !important;
            border: 1px solid #f59e0b;
            box-shadow: 0 12px 24px rgba(234, 88, 12, 0.4);
        }
        #activity-modal.block-runner-mode .activity-pause-card .btn:hover {
            transform: translateY(-1px) scale(1.02);
            filter: brightness(1.03);
        }
        #activity-modal.block-runner-mode .activity-pause-card .pause-title {
            font-size: 11px;
            font-weight: 700;
            color: #1f2937;
            letter-spacing: 0.3px;
        }
        #activity-modal.fullscreen .activity-layout { grid-template-columns: 1fr; }
        #activity-modal.fullscreen .activity-left { display: none; }
        #activity-modal.fullscreen .modal-header { display: none; }
        #activity-modal.block-3d-mode .activity-layout { grid-template-columns: 1fr !important; }
        #activity-modal.block-3d-mode .activity-left { display: none !important; }
        #activity-modal.block-3d-mode .modal-header { display: none !important; }
        #activity-modal.block-3d-mode .modal-content {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        #activity-modal.fullscreen .modal-content {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        #activity-modal.fullscreen .activity-right {
            border-radius: 0 !important;
            border: 0 !important;
        }
        #content-modal.fullscreen .modal-content { width: 98vw; max-width: 98vw; height: 90vh; max-height: 90vh; padding: 12px; }
        #content-modal.fullscreen .content-layout { height: 100%; }
        #content-modal.fullscreen .content-right { height: 100%; }
        #content-modal.fullscreen .content-viewer-wrap { height: 100%; grid-template-columns: 300px 1fr; }
        .content-item { padding: 10px; border-radius: 10px; background: #fff; border: 1px solid #e5e7eb; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .content-item.active { border-color: var(--primary); background: #eef6ff; }
        .content-tag { font-size: 11px; color: #555; background: #eef2ff; padding: 2px 6px; border-radius: 999px; }
        .content-editor-item { border: 1px dashed #cbd5e1; border-radius: 10px; padding: 10px; margin-bottom: 10px; background: #f8fafc; }
        .drag-handle { cursor: grab; font-weight: bold; margin-right: 8px; }
        .progress-mini { height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-top: 6px; }
        .progress-mini > div { height: 100%; background: linear-gradient(90deg, #2563eb, #22c55e); }
        #student-stats-bar { display: block; }
        #student-stats-bar .stats-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        #student-stats-bar .stat-card { min-width: 0; margin: 0; display: flex; flex-direction: column; justify-content: center; }
        #student-stats-bar .stat-number { font-size: 1.3rem; }
        #student-stats-bar .stat-label { font-size: 0.78rem; margin-top: 2px; }
        #student-stats-bar .completed-card { background: #e8f7ee; border: 1px solid #b7ebc6; }
        #student-stats-bar .completed-card .stat-label { color: #166534; }
        #student-stats-bar .completed-card .completed-summary .item { background: #f3fcf6; border-color: #cfeeda; }
        #student-stats-bar .completed-card .completed-summary .item .k { color: #166534; }
        #student-stats-bar .completed-card .completed-summary .item .v { color: #15803d; }
        .completed-summary { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; overflow: visible; }
        .completed-summary .item { flex: 1 1 92px; min-width: 86px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 9px; padding: 6px; text-align: center; }
        .completed-summary .item .k { font-size: 0.7rem; color: #64748b; }
        .completed-summary .item .v { font-size: 0.96rem; font-weight: 600; color: #2563eb; margin-top: 1px; }
        .completed-summary .item.xp-item .k { color: #0f5132; }
        .completed-summary .item.xp-item .v { color: var(--success); }
        .login-cards-modal-content {
            width: min(1120px, 96vw);
            max-height: 92vh;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .login-cards-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }
        .login-cards-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            max-height: 72vh;
            overflow: auto;
            padding-right: 4px;
        }
        .login-card-item {
            position: relative;
            border: 1px solid #c4b5fd;
            border-radius: 16px;
            background:
                linear-gradient(165deg, rgba(255,255,255,0.94) 0%, rgba(250,245,255,0.96) 42%, rgba(243,232,255,0.98) 100%);
            box-shadow: 0 10px 22px rgba(76, 29, 149, 0.18);
            padding: 12px 12px 14px 22px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-height: 154px;
            overflow: hidden;
        }
        .login-card-item::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 104px;
            background:
                linear-gradient(90deg, rgba(76,29,149,0.95), rgba(109,40,217,0.8));
            border-bottom: 1px solid #ddd6fe;
            pointer-events: none;
        }
        .login-card-item::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 20px;
            background:
                linear-gradient(180deg, rgba(76,29,149,0.98), rgba(124,58,237,0.9));
            clip-path: polygon(0 0, 100% 0, 72% 100%, 0 100%);
            pointer-events: none;
        }
        .login-card-accent {
            position: absolute;
            right: -22px;
            bottom: -16px;
            width: 110px;
            height: 58px;
            border-radius: 40px;
            transform: rotate(-12deg);
            background: linear-gradient(90deg, rgba(147,51,234,0.18), rgba(167,139,250,0.1));
            pointer-events: none;
        }
        .login-card-head {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 10px;
            padding-top: 2px;
        }
        .login-card-logo {
            width: 92px;
            height: 92px;
            border-radius: 14px;
            border: 1px solid #ddd6fe;
            background: #fff;
            object-fit: contain;
            padding: 4px;
            box-shadow: 0 6px 16px rgba(76, 29, 149, 0.24);
            flex: 0 0 auto;
        }
        .login-card-title-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 8px;
            min-height: 92px;
            min-width: 0;
            padding-top: 4px;
        }
        .login-card-title {
            display: flex;
            align-items: baseline;
            gap: 8px;
            flex: 1 1 auto;
            font-size: 1.42rem;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.1;
            letter-spacing: 0.01em;
            text-shadow: 0 2px 4px rgba(49, 46, 129, 0.42);
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .login-card-title .name {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .login-card-meta {
            font-size: 0.98rem;
            font-weight: 600;
            color: #f5f3ff;
            text-shadow: 0 1px 2px rgba(49, 46, 129, 0.35);
            max-width: 48%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.2;
            margin-top: 0;
        }
        .login-card-fields {
            position: relative;
            z-index: 1;
            display: grid;
            gap: 8px;
            margin-top: 4px;
        }
        .login-card-foot {
            position: relative;
            z-index: 1;
            margin-top: auto;
            text-align: right;
            font-size: 0.78rem;
            font-weight: 700;
            color: #6d28d9;
        }
        .login-card-field {
            display: grid;
            grid-template-columns: 28px 1fr;
            border: 1px solid #ddd6fe;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.92);
            overflow: hidden;
        }
        .login-card-field .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            color: #4c1d95;
            background: #ede9fe;
            border-right: 1px solid #ddd6fe;
        }
        .login-card-field .val {
            padding: 7px 10px;
            font-size: 0.95rem;
            font-weight: 700;
            color: #312e81;
            letter-spacing: 0.01em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .login-cards-empty {
            text-align: center;
            padding: 24px;
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            color: #64748b;
            background: #f8fafc;
        }
        .teacher-top-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: center; }
        #lesson-builder-modal {
            z-index: 24050;
            background: rgba(8, 15, 31, 0.88);
            align-items: stretch;
            justify-content: stretch;
        }
        .lesson-builder-shell {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            display: grid;
            grid-template-rows: 64px 1fr;
            background:
                radial-gradient(circle at top right, rgba(59,130,246,0.18), rgba(255,255,255,0) 38%),
                linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%);
        }
        .lesson-builder-topbar {
            display: grid;
            grid-template-columns: auto minmax(280px, 620px) auto;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-bottom: 1px solid #dbe2ef;
            background: #ffffff;
        }
        .lesson-builder-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #0f172a;
            font-weight: 700;
            letter-spacing: 0.2px;
            white-space: nowrap;
        }
        .lesson-builder-brand .dot {
            width: 12px;
            height: 12px;
            border-radius: 999px;
            background: linear-gradient(120deg, #2563eb, #22c55e);
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.16);
        }
        .lesson-title-wrap { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .lesson-title-wrap .lesson-main-input {
            margin: 0;
            height: 42px;
            border-radius: 10px;
            font-size: 1.02rem;
            font-weight: 700;
            background: #f8fafc;
            border-color: #d6deec;
        }
        .lesson-builder-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        .lesson-builder-main {
            min-height: 0;
            display: grid;
            grid-template-columns: 240px 1fr 300px;
            gap: 10px;
            padding: 10px;
        }
        .lesson-panel {
            background: #ffffff;
            border: 1px solid #d4deee;
            border-radius: 14px;
            min-height: 0;
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
        }
        .lesson-panel.left {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .lesson-left-top {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: space-between;
        }
        .lesson-left-top .title {
            font-weight: 800;
            color: #0f172a;
            font-size: 0.9rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        #lesson-slide-list {
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px;
        }
        .lesson-frame-item {
            width: 100%;
            border: 1px solid #d9e1ef;
            border-radius: 12px;
            background: #f8fafc;
            color: #0f172a;
            text-align: left;
            padding: 10px;
            cursor: pointer;
            transition: all .18s ease;
        }
        .lesson-frame-item:hover { border-color: #93c5fd; background: #eff6ff; }
        .lesson-frame-item.active {
            border-color: #2563eb;
            background: linear-gradient(160deg, #eaf2ff, #dbeafe);
            box-shadow: inset 0 0 0 1px rgba(37,99,235,0.18);
        }
        .lesson-frame-title { font-weight: 700; font-size: 0.92rem; line-height: 1.3; }
        .lesson-frame-meta { margin-top: 4px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .lesson-panel.center {
            display: flex;
            flex-direction: column;
            min-height: 0;
            padding: 10px;
            gap: 8px;
        }
        .lesson-toolbar {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            border: 1px solid #d1d9e8;
            border-radius: 10px;
            padding: 6px;
            background: #f8fafc;
        }
        .lesson-toolbar .btn {
            margin: 0;
            background: #fff;
            color: #334155;
            padding: 7px 10px;
            border: 1px solid #d5dde9;
            font-weight: 700;
            min-width: 40px;
            border-radius: 8px;
        }
        .lesson-quick-tools {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            margin-top: 2px;
        }
        .lesson-quick-tools .btn {
            margin: 0;
            font-weight: 700;
            border-radius: 10px;
        }
        .lesson-editor-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin: 0 0 6px;
            font-size: 0.8rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 800;
        }
        .lesson-question-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .lesson-question-grid .form-control:first-child,
        .lesson-question-grid .full {
            grid-column: 1 / -1;
        }
        .lesson-editor-scroll {
            flex: 1;
            min-height: 0;
            overflow: auto;
            border: 1px solid #dbe3f0;
            border-radius: 12px;
            background: #ffffff;
            padding: 10px;
        }
        .lesson-content-block {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
            padding: 10px;
            margin-top: 8px;
        }
        #slide-content-editor {
            min-height: 220px !important;
            border: 1px solid #d4deee !important;
            border-radius: 10px !important;
            background: #fff !important;
            padding: 10px !important;
        }
        #lesson-slide-preview {
            margin-top: 10px;
            border: 1px solid #dbe3f0 !important;
            border-radius: 10px !important;
            padding: 10px !important;
            background: #f8fafc !important;
            min-height: 130px !important;
        }
        .lesson-panel.right {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 0;
            overflow: auto;
            padding: 10px;
        }
        .lesson-side-title {
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #64748b;
            margin: 2px 0 0;
        }
        .lesson-side-block {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
            padding: 8px;
        }
        .lesson-theme-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 6px;
        }
        .lesson-theme-item {
            border: 1px solid #d6deec;
            border-radius: 10px;
            background: #fff;
            padding: 8px;
            cursor: pointer;
            text-align: left;
        }
        .lesson-theme-item.active {
            border-color: #2563eb;
            box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.2);
            background: #eff6ff;
        }
        .lesson-theme-name { font-size: 0.82rem; font-weight: 700; color: #0f172a; }
        .lesson-theme-swatch {
            margin-top: 6px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid rgba(15, 23, 42, 0.1);
            overflow: hidden;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
        }
        .lesson-theme-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 8px;
        }
        #lesson-text-modal { z-index: 26002 !important; }
        
        .time-badge { background: #e3f2fd; color: var(--primary); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
        .live-quiz-invite-card {
            border: 2px solid #fb923c;
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.55);
            animation: liveInvitePulse 1.15s infinite;
        }
        .live-quiz-builder {
            display: grid;
            grid-template-columns: 240px 1fr 300px;
            gap: 12px;
            flex: 1;
            min-height: 0;
        }
        .live-quiz-sidebar {
            border: 1px solid #d8d8dd;
            border-radius: 12px;
            background: #ffffff;
            padding: 10px 10px 12px;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        .live-quiz-sidebar-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        .live-quiz-sidebar-head .title {
            font-size: 0.9rem;
            font-weight: 800;
            color: #111827;
        }
        #live-quiz-question-list {
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-right: 2px;
        }
        .live-quiz-question-row {
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 12px;
            text-align: left;
            padding: 8px 10px;
            cursor: pointer;
            transition: 0.2s ease;
        }
        .live-quiz-question-row.active {
            border-color: #2563eb;
            box-shadow: inset 0 0 0 1px rgba(37,99,235,0.2);
            background: #eef4ff;
        }
        .live-quiz-question-row:hover { transform: translateX(2px); }
        .live-quiz-question-row .meta {
            color: #64748b;
            font-size: 12px;
            margin-top: 3px;
        }
        .live-quiz-canvas {
            border: 1px solid #d6ccff;
            border-radius: 14px;
            padding: 14px;
            overflow: auto;
            background:
                linear-gradient(180deg, rgba(80, 41, 166, 0.84), rgba(45, 23, 94, 0.88)),
                radial-gradient(circle at top left, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 56%);
        }
        .live-quiz-global {
            display: grid;
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
        }
        .live-quiz-editor-card {
            border: 1px solid rgba(255,255,255,0.34);
            border-radius: 12px;
            padding: 12px;
            background: rgba(243, 240, 255, 0.92);
        }
        .live-quiz-main-question {
            height: 64px;
            font-size: 1.1rem;
            border-radius: 10px;
            text-align: center;
            font-weight: 700;
        }
        .live-quiz-media-drop {
            margin-top: 10px;
            border: 2px dashed #b6a2e9;
            border-radius: 12px;
            background: rgba(255,255,255,0.75);
            padding: 10px;
            text-align: center;
        }
        .live-quiz-media-drop input[type="file"] {
            display: none;
        }
        .live-quiz-media-label {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: #5b21b6;
            color: #fff;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 0.9rem;
        }
        .live-quiz-media-preview {
            margin-top: 8px;
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 0.85rem;
        }
        .live-quiz-media-preview img {
            max-width: 100%;
            max-height: 180px;
            border-radius: 8px;
            border: 1px solid #ddd6fe;
            object-fit: cover;
        }
        .live-quiz-options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 8px;
        }
        .live-quiz-option-input {
            border-radius: 10px !important;
            color: #fff !important;
            border: none !important;
            font-weight: 600;
            min-height: 54px;
            font-size: 1rem;
        }
        #live-q-a { background: #ef4444 !important; }
        #live-q-b { background: #2563eb !important; }
        #live-q-c { background: #eab308 !important; color: #1f2937 !important; }
        #live-q-d { background: #16a34a !important; }
        #live-q-a::placeholder, #live-q-b::placeholder, #live-q-c::placeholder, #live-q-d::placeholder { color: rgba(255,255,255,0.92); }
        #live-q-c::placeholder { color: rgba(31,41,55,0.85); }
        .live-quiz-preview {
            margin-top: 10px;
            border-radius: 12px;
            border: 1px dashed rgba(255,255,255,0.4);
            background: linear-gradient(145deg, rgba(25,20,53,0.82) 0%, rgba(73,38,143,0.76) 100%);
            padding: 12px;
            color: #fff;
        }
        .live-quiz-right-panel {
            border: 1px solid #dddfe6;
            border-radius: 12px;
            background: #fff;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-height: 0;
        }
        .live-quiz-right-title {
            font-size: 1.05rem;
            font-weight: 800;
            color: #111827;
        }
        .live-quiz-right-block {
            border-top: 1px solid #eceff3;
            padding-top: 10px;
            display: grid;
            gap: 8px;
        }
        .live-quiz-right-block .label {
            font-size: 0.85rem;
            color: #374151;
            font-weight: 700;
        }
        .live-quiz-actions-footer {
            margin-top: auto;
            border-top: 1px solid #eceff3;
            padding-top: 10px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        @media (max-width: 1180px) {
            .live-quiz-builder { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
            .live-quiz-global,
            .live-quiz-options-grid,
            .live-quiz-preview-grid { grid-template-columns: 1fr; }
        }
        .live-quiz-preview-q { font-size: 1.03rem; font-weight: 700; margin-bottom: 8px; }
        .live-quiz-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .live-quiz-preview-item {
            border-radius: 10px;
            padding: 9px 10px;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.15);
            font-weight: 600;
            font-size: 0.9rem;
        }
        #live-quiz-modal {
            z-index: 24060;
            align-items: stretch;
            justify-content: stretch;
            background: rgba(8, 15, 31, 0.9);
        }
        #live-quiz-modal .modal-content {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            padding: 10px !important;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .live-player-option {
            border-radius: 10px !important;
            border: 1px solid #d1d5db !important;
            text-align: left !important;
            font-weight: 700 !important;
            transition: 0.18s ease !important;
        }
        .live-player-shell {
            max-width: 1040px !important;
            width: 96vw;
            border-radius: 18px;
            border: 1px solid #c7d2fe;
            background:
                radial-gradient(circle at 85% 0%, rgba(79, 70, 229, 0.18), rgba(79, 70, 229, 0) 34%),
                linear-gradient(145deg, #f8fbff 0%, #eef4ff 100%);
            padding: 14px;
        }
        .live-player-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }
        #live-player-title {
            margin: 0;
            font-size: 1.32rem;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: 0.2px;
        }
        .live-player-timer {
            min-width: 130px;
            text-align: center;
            padding: 10px 14px;
            border-radius: 999px;
            background: linear-gradient(135deg, #1d4ed8, #4f46e5);
            color: #fff;
            font-size: 1.04rem;
            font-weight: 800;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
            border: 1px solid rgba(255,255,255,0.5);
        }
        .live-player-timer.warn {
            background: linear-gradient(135deg, #f59e0b, #ea580c);
            box-shadow: 0 10px 24px rgba(234, 88, 12, 0.25);
        }
        .live-player-timer.danger {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            box-shadow: 0 10px 24px rgba(185, 28, 28, 0.3);
        }
        .live-player-question {
            margin-top: 12px;
            font-size: 1.18rem;
            font-weight: 800;
            color: #fff;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.28);
            background: linear-gradient(140deg, #334155 0%, #1e3a8a 55%, #4f46e5 100%);
            padding: 14px 16px;
            line-height: 1.35;
        }
        .live-player-options {
            margin-top: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .live-player-option {
            min-height: 58px;
            border: none !important;
            color: #fff !important;
            padding: 12px 14px !important;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
            display: flex !important;
            align-items: center;
            gap: 10px;
            font-size: 1rem !important;
        }
        .live-player-option.opt-a { background: linear-gradient(135deg, #ef4444, #dc2626) !important; }
        .live-player-option.opt-b { background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important; }
        .live-player-option.opt-c { background: linear-gradient(135deg, #f59e0b, #d97706) !important; }
        .live-player-option.opt-d { background: linear-gradient(135deg, #22c55e, #15803d) !important; }
        .live-player-option.tf-true { background: linear-gradient(135deg, #16a34a, #15803d) !important; }
        .live-player-option.tf-false { background: linear-gradient(135deg, #dc2626, #b91c1c) !important; }
        .live-player-option .opt-key {
            min-width: 28px;
            height: 28px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.22);
            border: 1px solid rgba(255,255,255,0.35);
            font-weight: 800;
            font-size: 0.86rem;
        }
        .live-player-option .opt-text {
            font-weight: 700;
            line-height: 1.2;
        }
        .live-player-option.selected {
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.28), inset 0 0 0 2px rgba(255,255,255,0.75);
        }
        .live-player-option.selected.correct {
            box-shadow: 0 14px 30px rgba(22, 163, 74, 0.35), inset 0 0 0 2px rgba(236, 253, 245, 0.95);
        }
        .live-player-option.selected.wrong {
            box-shadow: 0 14px 30px rgba(220, 38, 38, 0.35), inset 0 0 0 2px rgba(254, 226, 226, 0.95);
        }
        .live-player-info {
            margin-top: 10px;
            font-size: 0.95rem;
            color: #334155;
            font-weight: 600;
            background: #f8fafc;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            padding: 8px 10px;
        }
        .live-match-board {
            margin-top: 12px;
            border: 1px solid #dbeafe;
            border-radius: 12px;
            background: #f8fbff;
            padding: 10px;
        }
        .live-match-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .live-match-col-title {
            font-size: 0.82rem;
            font-weight: 800;
            color: #475569;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .live-match-left-item,
        .live-match-dropzone,
        .live-match-chip {
            border-radius: 10px;
            padding: 9px 10px;
            font-weight: 700;
            line-height: 1.25;
        }
        .live-match-left-item {
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            color: #1e3a8a;
            margin-bottom: 8px;
        }
        .live-match-dropzone {
            background: #fff;
            border: 2px dashed #bfdbfe;
            color: #475569;
            min-height: 44px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .live-match-dropzone.filled {
            border-style: solid;
            border-color: #60a5fa;
            background: #eff6ff;
            color: #1e3a8a;
        }
        .live-match-chip-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .live-match-chip {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.35);
            cursor: grab;
            user-select: none;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
        }
        .live-match-chip.used {
            opacity: 0.35;
            cursor: not-allowed;
        }
        .live-match-submit {
            margin-top: 8px;
            width: 100%;
        }
        @media (max-width: 900px) {
            .live-player-options { grid-template-columns: 1fr; }
            .live-match-grid { grid-template-columns: 1fr; }
            .live-player-timer { min-width: 106px; font-size: 0.96rem; padding: 8px 10px; }
            #live-player-title { font-size: 1.1rem; }
            .live-player-question { font-size: 1.03rem; padding: 12px; }
        }
        #teacher-live-monitor-modal {
            z-index: 26050;
            background: rgba(2, 6, 23, 0.84);
            backdrop-filter: blur(3px);
        }
        .teacher-live-monitor-shell {
            width: 98vw;
            height: 94vh;
            max-width: 1480px;
            border-radius: 18px;
            border: 1px solid #cbd5e1;
            background:
                radial-gradient(circle at top right, rgba(37, 99, 235, 0.22), rgba(255,255,255,0) 35%),
                linear-gradient(145deg, #f8fbff 0%, #eef4ff 100%);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            overflow: hidden;
        }
        .teacher-live-monitor-head {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            align-items: center;
        }
        .teacher-live-monitor-title {
            font-size: 1.18rem;
            font-weight: 800;
            color: #1e3a8a;
        }
        .teacher-live-monitor-sub {
            font-size: 0.9rem;
            color: #475569;
            margin-top: 2px;
        }
        .teacher-live-monitor-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        .teacher-live-monitor-metrics {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
        }
        .teacher-live-metric {
            border: 1px solid #dbeafe;
            border-radius: 12px;
            background: #ffffff;
            padding: 8px 10px;
        }
        .teacher-live-metric .k {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
        }
        .teacher-live-metric .v {
            font-size: 1.16rem;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
        }
        #teacher-live-monitor-list {
            flex: 1;
            min-height: 0;
            overflow: auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 10px;
            align-content: start;
            padding-right: 2px;
        }
        .teacher-live-student-card {
            border: 1px solid #dbeafe;
            border-radius: 14px;
            background: #fff;
            padding: 10px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
            animation: liveCardIn 0.24s ease;
        }
        .teacher-live-student-card.answered {
            border-color: #86efac;
            box-shadow: 0 10px 22px rgba(22, 163, 74, 0.14);
        }
        .teacher-live-student-card.pending {
            border-color: #fca5a5;
        }
        .teacher-live-student-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 8px;
        }
        .teacher-live-student-name {
            font-weight: 800;
            color: #0f172a;
            line-height: 1.2;
        }
        .teacher-live-student-rank {
            min-width: 34px;
            height: 34px;
            border-radius: 999px;
            background: #dbeafe;
            color: #1e3a8a;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .teacher-live-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            font-weight: 700;
            border-radius: 999px;
            padding: 4px 8px;
            margin-bottom: 6px;
        }
        .teacher-live-status::before {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 999px;
            display: inline-block;
            animation: livePulse 1.2s infinite;
        }
        .teacher-live-status.answered {
            background: #dcfce7;
            color: #166534;
        }
        .teacher-live-status.answered::before { background: #16a34a; }
        .teacher-live-status.pending {
            background: #fee2e2;
            color: #991b1b;
        }
        .teacher-live-status.pending::before { background: #dc2626; }
        .teacher-live-student-meta {
            font-size: 0.86rem;
            color: #334155;
            display: grid;
            gap: 3px;
        }
        @keyframes liveCardIn {
            from { opacity: 0; transform: translateY(6px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes livePulse {
            0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.35); }
            100% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
        }
        .certificate-shell {
            max-width: 1100px !important;
            width: 96vw;
            background:
                radial-gradient(circle at 95% 0%, rgba(250, 204, 21, 0.18), rgba(250, 204, 21, 0) 36%),
                radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0) 42%),
                linear-gradient(155deg, #f8fafc 0%, #eef2ff 100%);
            border: 1px solid #dbe4ff;
        }
        .certificate-modal-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        .student-certificate {
            position: relative;
            overflow: hidden;
            width: 100%;
            min-height: 560px;
            border-radius: 22px;
            border: 1px solid #f5d67a;
            background:
                radial-gradient(circle at 20% 12%, rgba(245, 158, 11, 0.24), rgba(245, 158, 11, 0) 35%),
                radial-gradient(circle at 85% 88%, rgba(59, 130, 246, 0.16), rgba(59, 130, 246, 0) 42%),
                linear-gradient(160deg, #fffdf5 0%, #ffffff 52%, #f8fbff 100%);
            box-shadow: 0 30px 70px rgba(30, 41, 59, 0.18);
            padding: 38px 34px 34px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 10px;
        }
        .student-certificate::before {
            content: "";
            position: absolute;
            inset: 14px;
            border-radius: 16px;
            border: 3px double rgba(190, 145, 0, 0.55);
            pointer-events: none;
        }
        .student-certificate::after {
            content: "";
            position: absolute;
            width: 260px;
            height: 260px;
            right: -110px;
            top: -120px;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(250, 204, 21, 0.24), rgba(250, 204, 21, 0));
            pointer-events: none;
        }
        .certificate-logo {
            width: 120px;
            height: auto;
            margin: 0 auto 8px;
            border-radius: 16px;
            padding: 10px;
            border: 1px solid #fde68a;
            background: linear-gradient(145deg, #ffffff, #fff7e6);
            box-shadow: 0 8px 18px rgba(146, 64, 14, 0.14);
        }
        .certificate-kicker {
            font-size: 0.78rem;
            letter-spacing: 0.28em;
            font-weight: 800;
            color: #92400e;
            text-transform: uppercase;
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 999px;
            padding: 6px 12px;
        }
        .certificate-title {
            font-family: "Cinzel", "Times New Roman", Georgia, serif;
            font-size: 2.55rem;
            letter-spacing: 0.09em;
            color: #7c2d12;
            margin-bottom: 4px;
            font-weight: 800;
            text-transform: uppercase;
            text-shadow: 0 2px 10px rgba(146, 64, 14, 0.12);
        }
        .certificate-text {
            max-width: 800px;
            font-size: 1.05rem;
            line-height: 1.75;
            color: #334155;
            margin: 0;
        }
        .certificate-student-name {
            font-family: "Cinzel", "Times New Roman", Georgia, serif;
            font-size: 2.95rem;
            line-height: 1.2;
            font-weight: 800;
            color: #1e293b;
            margin: 12px 0 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid rgba(180, 83, 9, 0.28);
            padding: 0 10px 8px;
        }
        .certificate-meta-row {
            margin-top: 10px;
            width: 100%;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
        }
        .certificate-meta-item {
            border: 1px solid #e5e7eb;
            background: linear-gradient(160deg, rgba(255,255,255,0.95), rgba(255, 249, 235, 0.9));
            border-radius: 14px;
            padding: 11px 8px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 3px;
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
        }
        .certificate-meta-item .k {
            font-size: 0.7rem;
            letter-spacing: 0.06em;
            color: #92400e;
            text-transform: uppercase;
            font-weight: 700;
        }
        .certificate-meta-item .v {
            font-size: 1.08rem;
            font-weight: 800;
            color: #0f172a;
        }
        .certificate-footer-note {
            margin-top: 12px;
            font-size: 0.95rem;
            color: #475569;
            border-top: 1px solid rgba(180, 83, 9, 0.25);
            padding-top: 10px;
            width: 100%;
        }
        .teacher-cert-toolbar {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
            margin-bottom: 10px;
            align-items: end;
        }
        .teacher-cert-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 10px;
        }
        .teacher-cert-note {
            margin: 0 0 8px;
            font-size: 0.9rem;
            color: #475569;
        }
        @media (max-width: 900px) {
            .student-certificate {
                min-height: 0;
                padding: 22px 16px;
            }
            .certificate-title {
                font-size: 1.45rem;
            }
            .certificate-text {
                font-size: 0.95rem;
            }
            .certificate-student-name {
                font-size: 1.55rem;
            }
            .certificate-meta-row {
                grid-template-columns: 1fr 1fr;
            }
            .teacher-cert-toolbar {
                grid-template-columns: 1fr 1fr;
            }
        }
        @keyframes liveInvitePulse {
            0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.55); }
            70% { box-shadow: 0 0 0 14px rgba(249, 115, 22, 0); }
            100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        .deadline-badge { background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; }
        .deadline-expired { background: #f8d7da; color: #721c24; }
        
        .activity-history-item { padding: 12px; background: #f8f9fa; margin-bottom: 8px; border-radius: 8px; border-left: 3px solid var(--success); }
        
        .empty-state { text-align: center; padding: 40px 20px; color: #888; }
        .empty-state-icon { font-size: 3rem; margin-bottom: 10px; }
        
        .loading { text-align: center; padding: 20px; color: var(--primary); }
        
        .date-input { font-family: inherit; }
        .login-screen { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #edf3ff 0%, #f8fafc 100%); z-index: 3000; min-height: 100svh; height: 100svh; width: 100vw; }
        .login-screen.hidden { display: none !important; }
        .login-screen .login-card { position: relative; top: auto; left: auto; transform: none; margin: 0; pointer-events: auto; }
        .login-card {
            width: min(1080px, 100%);
            min-height: min(680px, 92svh);
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            box-shadow: 0 30px 70px rgba(15, 23, 42, 0.14);
            overflow: hidden;
            padding: 0;
        }
        .login-layout {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            min-height: min(680px, 92svh);
        }
        .login-left {
            background: linear-gradient(160deg, #dbe7f8 0%, #eef2f9 100%);
            padding: 36px 36px 30px;
            display: grid;
            grid-template-rows: auto 1fr auto;
            align-items: center;
            gap: 20px;
        }
        .login-left-top h2 {
            margin: 0;
            font-size: 2.1rem;
            color: #1f2937;
            letter-spacing: -0.4px;
            text-align: center;
        }
        .login-left-top p {
            margin: 8px 0 0;
            color: #475569;
            font-size: 1.02rem;
            text-align: center;
        }
        .login-hero-logo {
            max-width: 360px;
            width: 100%;
            margin: 0 auto;
            display: block;
            filter: drop-shadow(0 12px 26px rgba(30, 64, 175, 0.18));
        }
        .login-slogan {
            text-align: center;
            color: #1e293b;
            font-size: 1.03rem;
            letter-spacing: 0.3px;
            font-weight: 500;
            margin: 0;
        }
        .login-right {
            padding: 44px 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
        }
        .login-form-wrap {
            width: 100%;
            max-width: 430px;
            display: grid;
            gap: 12px;
        }
        .login-form-wrap h3 {
            margin: 0;
            font-size: 2rem;
            color: #111827;
            letter-spacing: -0.4px;
        }
        .login-form-wrap .login-sub {
            margin: 0 0 8px;
            color: #64748b;
            font-size: 1.02rem;
        }
        .login-form-wrap label {
            color: #475569;
            font-weight: 600;
            margin-top: 2px;
        }
        .login-title-bar { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
        .theme-toggle-inline {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
            background: #ffffff;
            color: #1f2937;
            font-size: 17px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        }
        .theme-toggle-inline:hover { background: #f8fafc; }
        .theme-toggle {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 34px;
            height: 34px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
            background: #ffffff;
            color: #1f2937;
            font-size: 17px;
            cursor: pointer;
        }
        .theme-toggle:hover { background: #f8fafc; }
        #login-screen .form-control { max-width: 100%; box-sizing: border-box; height: 52px; border-radius: 12px; border: 1px solid #dbe2ef; background: #f2f6ff; }
        #login-screen .form-control:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); outline: none; }
        #login-screen .btn { max-width: 100%; box-sizing: border-box; }
        .login-logo { width: 110px; height: auto; display: block; margin: 0 auto 10px; }
        .login-actions { display: flex; gap: 10px; }
        .login-actions .btn { flex: 1 1 0; min-width: 0; }
        #btn-login {
            margin-top: 8px;
            height: 52px;
            border-radius: 12px;
            font-size: 1.05rem;
            font-weight: 700;
            background: linear-gradient(90deg, #2563eb, #1d4ed8);
        }

        body.dark-mode { background: #0b1220 !important; color: #e5e7eb; }
        body.dark-mode #app-screen { background: #0f172a !important; }
        body.dark-mode .card,
        body.dark-mode .modal-content,
        body.dark-mode .home-overview-card,
        body.dark-mode .list-item,
        body.dark-mode .student-list-item,
        body.dark-mode .stat-card,
        body.dark-mode .tab-content,
        body.dark-mode .content-item,
        body.dark-mode .kpi,
        body.dark-mode .info-pill {
            background: #111827 !important;
            color: #e5e7eb !important;
            border-color: #374151 !important;
            box-shadow: none !important;
        }
        body.dark-mode .form-control,
        body.dark-mode select,
        body.dark-mode textarea,
        body.dark-mode input {
            background: #0b1220 !important;
            color: #e5e7eb !important;
            border-color: #334155 !important;
        }
        body.dark-mode .tabs,
        body.dark-mode .filter-bar,
        body.dark-mode .chart-container {
            background: #111827 !important;
            border-color: #334155 !important;
        }
        body.dark-mode .tab-btn,
        body.dark-mode .filter-btn,
        body.dark-mode .btn {
            color: #e5e7eb;
            border-color: #334155;
        }
        body.dark-mode .tab-btn:not(.active),
        body.dark-mode .filter-btn:not(.active),
        body.dark-mode .btn:not(.btn-primary):not(.btn-success):not(.btn-danger):not(.btn-warning) {
            background: #1f2937 !important;
        }
        body.dark-mode #side-menu { background-color: #020617; }
        body.dark-mode #side-menu .sidebar-footer { border-top-color: #1f2937; }
        body.dark-mode .sidebar-footer-title { color: #94a3b8; }
        body.dark-mode #side-menu button { color: #cbd5e1; }
        body.dark-mode #side-menu button:hover { background: #111827; color: #e5e7eb; }
        body.dark-mode #side-menu button.active { background: #1e293b; color: #93c5fd; }
        body.dark-mode #side-menu .sidebar-group-toggle { color: #cbd5e1 !important; border-top-color: #1f2937; }
        body.dark-mode #side-menu .sidebar-submenu .submenu-item { color: #94a3b8 !important; }
        body.dark-mode #side-menu .sidebar-submenu .submenu-item:hover { background: #111827; color: #e2e8f0 !important; }
        body.dark-mode #side-menu .sidebar-logo { border-color: rgba(148, 163, 184, 0.35); }
        body.dark-mode #user-dropdown { background: #0f172a !important; border-color: #334155 !important; }
        body.dark-mode #user-menu-trigger,
        body.dark-mode #user-welcome,
        body.dark-mode #user-fullname {
            color: #e5e7eb !important;
        }
        body.dark-mode #user-menu-trigger {
            background: #1f2937 !important;
            border-color: #334155 !important;
        }
        body.dark-mode #user-header-avatar {
            border-color: #0f172a;
            box-shadow: 0 6px 14px rgba(2, 6, 23, 0.55);
        }
        body.dark-mode .avatar-shop-modal-content {
            background: #0f172a !important;
            border-color: #334155 !important;
        }
        body.dark-mode .avatar-card {
            background: linear-gradient(160deg, #111827, #0b1220);
            border-color: #334155;
        }
        body.dark-mode .avatar-card.owned { background: #052e21; border-color: #10b981; }
        body.dark-mode .avatar-cost { color: #cbd5e1; }
        body.dark-mode .avatar-shop-xp {
            background: #052e21;
            border-color: #10b981;
            color: #d1fae5;
        }
        body.dark-mode .edu-ai-panel {
            background: #0f172a;
            border-color: #334155;
        }
        body.dark-mode .edu-ai-fab {
            background:
                radial-gradient(circle at 32% 20%, rgba(255,255,255,0.25), rgba(255,255,255,0) 40%),
                linear-gradient(145deg, #0f172a, #1e3a8a 58%, #2563eb);
            border-color: rgba(148, 163, 184, 0.55);
        }
        body.dark-mode .edu-ai-core {
            border-color: #cbd5e1;
            box-shadow: 0 10px 20px rgba(2, 6, 23, 0.48), inset 0 0 0 1px rgba(255,255,255,0.2);
        }
        body.dark-mode .edu-ai-wing {
            background: linear-gradient(180deg, #f8fafc, #cbd5e1 62%, #94a3b8);
            border-color: #64748b;
        }
        body.dark-mode .edu-ai-panel-head {
            background: linear-gradient(130deg, #0b1220, #1e293b);
            border-bottom-color: #334155;
        }
        body.dark-mode .edu-ai-panel-title { color: #e2e8f0; }
        body.dark-mode .edu-ai-panel-sub { color: #94a3b8; }
        body.dark-mode .edu-ai-messages { background: #111827; }
        body.dark-mode .edu-ai-msg.user {
            background: #1e3a8a;
            color: #dbeafe;
            border-color: #1d4ed8;
        }
        body.dark-mode .edu-ai-msg.bot {
            background: #0b3a4a;
            color: #bae6fd;
            border-color: #155e75;
        }
        body.dark-mode .edu-ai-input-wrap,
        body.dark-mode .edu-ai-quick {
            background: #0f172a;
            border-top-color: #334155;
        }
        body.dark-mode .edu-ai-input {
            background: #111827;
            color: #e5e7eb;
            border-color: #334155;
        }
        body.dark-mode .edu-ai-quick button {
            background: #1f2937;
            color: #cbd5e1;
            border-color: #334155;
        }
        body.dark-mode #login-screen { background: radial-gradient(circle at top, #1f2a44, #090f1f) !important; }
        body.dark-mode .login-card { background: #111827 !important; border-color: #334155 !important; }
        body.dark-mode .login-slogan { color: #cbd5e1 !important; }
        body.dark-mode .theme-toggle { background: #1f2937; border-color: #334155; color: #e5e7eb; }
        body.dark-mode .theme-toggle-inline { background: #1f2937; border-color: #334155; color: #e5e7eb; }
        body.dark-mode .teacher-live-monitor-shell {
            border-color: #374151;
            background:
                radial-gradient(circle at top right, rgba(59, 130, 246, 0.2), rgba(17,24,39,0) 35%),
                linear-gradient(140deg, #0f172a 0%, #111827 100%);
        }
        body.dark-mode .teacher-live-monitor-title { color: #dbeafe; }
        body.dark-mode .teacher-live-monitor-sub { color: #94a3b8; }
        body.dark-mode .teacher-live-metric,
        body.dark-mode .teacher-live-student-card {
            background: #111827;
            border-color: #334155;
            color: #e5e7eb;
            box-shadow: none;
        }
        body.dark-mode .teacher-live-metric .k { color: #94a3b8; }
        body.dark-mode .teacher-live-metric .v,
        body.dark-mode .teacher-live-student-name { color: #e5e7eb; }
        body.dark-mode .teacher-live-student-meta { color: #cbd5e1; }
        body.dark-mode .teacher-live-student-rank {
            background: #1d4ed8;
            color: #dbeafe;
        }
        body.dark-mode .live-quiz-sidebar {
            border-color: #334155;
            background: #0b1220;
        }
        body.dark-mode .live-quiz-sidebar-head .title { color: #dbeafe; }
        body.dark-mode .live-quiz-question-row {
            background: #111827;
            border-color: #334155;
            color: #e5e7eb;
        }
        body.dark-mode .live-quiz-question-row.active {
            background: #1e293b;
            border-color: #3b82f6;
        }
        body.dark-mode .live-quiz-canvas {
            border-color: #43326b;
        }
        body.dark-mode .live-quiz-editor-card {
            background: rgba(17,24,39,0.88);
            border-color: #334155;
        }
        body.dark-mode .live-quiz-right-panel {
            background: #111827;
            border-color: #334155;
        }
        body.dark-mode .live-quiz-right-title,
        body.dark-mode .live-quiz-right-block .label {
            color: #e5e7eb;
        }
        body.dark-mode .live-quiz-media-drop {
            background: rgba(15,23,42,0.75);
            border-color: #5b4a87;
        }
        body.dark-mode .live-quiz-media-preview {
            color: #cbd5e1;
        }
        body.dark-mode .live-player-shell {
            border-color: #334155;
            background:
                radial-gradient(circle at 85% 0%, rgba(96, 165, 250, 0.25), rgba(96, 165, 250, 0) 35%),
                linear-gradient(145deg, #0f172a 0%, #111827 100%);
        }
        body.dark-mode #live-player-title { color: #dbeafe !important; }
        body.dark-mode .live-player-question {
            border-color: #334155;
            background: linear-gradient(140deg, #0b1220 0%, #1e293b 58%, #1e40af 100%);
            color: #e5e7eb;
        }
        body.dark-mode .live-player-info {
            background: #0f172a;
            border-color: #334155;
            color: #cbd5e1;
        }
        body.dark-mode .live-player-option { color: #f8fafc !important; }
        body.dark-mode .live-match-board { background: #0f172a; border-color: #334155; }
        body.dark-mode .live-match-left-item { background: #1e293b; border-color: #334155; color: #dbeafe; }
        body.dark-mode .live-match-dropzone { background: #111827; border-color: #334155; color: #94a3b8; }
        body.dark-mode .live-match-dropzone.filled { background: #1e3a8a; border-color: #3b82f6; color: #e0ecff; }
        body.dark-mode h1,
        body.dark-mode h2,
        body.dark-mode h3,
        body.dark-mode h4,
        body.dark-mode h5,
        body.dark-mode h6,
        body.dark-mode label,
        body.dark-mode small,
        body.dark-mode .stat-label,
        body.dark-mode .stat-detail-label,
        body.dark-mode .home-overview-title,
        body.dark-mode .home-overview-meta,
        body.dark-mode .top-student-meta,
        body.dark-mode .lesson-meta-note,
        body.dark-mode .lesson-slide-mini-head,
        body.dark-mode .time-label {
            color: #cbd5e1 !important;
        }
        body.dark-mode .home-overview-value,
        body.dark-mode .stat-number,
        body.dark-mode .stat-detail-value,
        body.dark-mode .top-student-name,
        body.dark-mode .pie-summary-val,
        body.dark-mode .certificate-title,
        body.dark-mode .certificate-student-name {
            color: #e2e8f0 !important;
        }
        body.dark-mode .activity-fullbar,
        body.dark-mode .app-topbar,
        body.dark-mode .activity-left,
        body.dark-mode .activity-right,
        body.dark-mode .app-workspace,
        body.dark-mode .app-frame-area,
        body.dark-mode .content-left,
        body.dark-mode .content-right,
        body.dark-mode .content-tag,
        body.dark-mode .question-edit-item,
        body.dark-mode .edit-section,
        body.dark-mode .stat-detail-item,
        body.dark-mode .activity-history-item,
        body.dark-mode .completed-summary .item,
        body.dark-mode .lesson-panel,
        body.dark-mode .lesson-slide-mini,
        body.dark-mode .lesson-editor-main,
        body.dark-mode .lesson-toolbar,
        body.dark-mode .lesson-toolbar .btn,
        body.dark-mode .lesson-quick-tools .btn,
        body.dark-mode .certificate-shell,
        body.dark-mode .pie-summary-item,
        body.dark-mode .time-widget {
            background: #111827 !important;
            color: #e5e7eb !important;
            border-color: #334155 !important;
        }
        body.dark-mode .time-block {
            background: #1e293b !important;
            border-color: #334155 !important;
        }
        body.dark-mode .time-val { color: #93c5fd !important; }
        body.dark-mode .time-label { color: #cbd5e1 !important; }
        body.dark-mode .lesson-builder-shell { background: linear-gradient(180deg, #0b1220 0%, #0f172a 100%) !important; }
        body.dark-mode .lesson-builder-topbar { background: #111827 !important; border-bottom-color: #1f2937 !important; }
        body.dark-mode .lesson-builder-brand,
        body.dark-mode .lesson-frame-title,
        body.dark-mode .lesson-side-title { color: #e5e7eb !important; }
        body.dark-mode .lesson-title-wrap .lesson-main-input,
        body.dark-mode .lesson-frame-item,
        body.dark-mode .lesson-side-block,
        body.dark-mode #slide-content-editor,
        body.dark-mode #lesson-slide-preview,
        body.dark-mode .lesson-content-block,
        body.dark-mode .lesson-editor-scroll {
            background: #0f172a !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
        }
        body.dark-mode .lesson-frame-item:hover,
        body.dark-mode .lesson-frame-item.active {
            background: #1e293b !important;
            border-color: #60a5fa !important;
        }
        body.dark-mode .lesson-theme-item { background: #0f172a !important; border-color: #334155 !important; }
        body.dark-mode .lesson-theme-item.active { background: #1e293b !important; border-color: #60a5fa !important; }
        body.dark-mode .lesson-theme-name { color: #e2e8f0 !important; }
        body.dark-mode .badge-success { background: #14532d !important; color: #dcfce7 !important; }
        body.dark-mode .badge-pending { background: #78350f !important; color: #fde68a !important; }
        body.dark-mode .badge-info,
        body.dark-mode .badge-progress { background: #1e3a8a !important; color: #dbeafe !important; }
        body.dark-mode .badge-danger { background: #7f1d1d !important; color: #fee2e2 !important; }
        body.dark-mode .badge-mid { background: #7c2d12 !important; color: #ffedd5 !important; }
        body.dark-mode [style*="color:#666"],
        body.dark-mode [style*="color: #666"],
        body.dark-mode [style*="color:#475569"],
        body.dark-mode [style*="color: #475569"],
        body.dark-mode [style*="color:#64748b"],
        body.dark-mode [style*="color: #64748b"],
        body.dark-mode [style*="color:#111827"],
        body.dark-mode [style*="color: #111827"],
        body.dark-mode [style*="color:#0f172a"],
        body.dark-mode [style*="color: #0f172a"] {
            color: #cbd5e1 !important;
        }
        body.dark-mode [style*="background:#eee"],
        body.dark-mode [style*="background: #eee"],
        body.dark-mode [style*="background:#f0f7ff"],
        body.dark-mode [style*="background: #f0f7ff"],
        body.dark-mode [style*="background:#e9f0ff"],
        body.dark-mode [style*="background: #e9f0ff"],
        body.dark-mode [style*="background:#f8f9fa"],
        body.dark-mode [style*="background: #f8f9fa"],
        body.dark-mode [style*="background:#fff"],
        body.dark-mode [style*="background: #fff"],
        body.dark-mode [style*="background:white"],
        body.dark-mode [style*="background: white"] {
            background: #1f2937 !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
        }
        body.dark-mode #tasks-section,
        body.dark-mode #activities-section,
        body.dark-mode #quiz-section,
        body.dark-mode #block-homework-section,
        body.dark-mode #compute-homework-section,
        body.dark-mode #lessons-section,
        body.dark-mode #student-homework-shell,
        body.dark-mode #student-apps-shell,
        body.dark-mode #leaderboard-section,
        body.dark-mode #top-students-card,
        body.dark-mode #teacher-analytics {
            background: linear-gradient(160deg, #0f172a 0%, #111827 100%) !important;
            border: 1px solid #334155 !important;
            box-shadow: 0 10px 26px rgba(2, 6, 23, 0.45) !important;
        }
        body.dark-mode #tasks-section h3,
        body.dark-mode #activities-section h3,
        body.dark-mode #quiz-section h3,
        body.dark-mode #block-homework-section h3,
        body.dark-mode #compute-homework-section h3,
        body.dark-mode #lessons-section h3,
        body.dark-mode .student-shell-head h3,
        body.dark-mode #leaderboard-section h3,
        body.dark-mode #top-students-card h4,
        body.dark-mode #teacher-analytics h4 {
            color: #e2e8f0 !important;
        }
        body.dark-mode .student-shell-head p {
            color: #94a3b8 !important;
        }
        body.dark-mode #tasks-section .tabs,
        body.dark-mode #activities-section .tabs,
        body.dark-mode #block-homework-section .tabs,
        body.dark-mode #compute-homework-section .tabs,
        body.dark-mode #lessons-section .tabs,
        body.dark-mode #teacher-filters,
        body.dark-mode #activity-filters,
        body.dark-mode #block-homework-filters,
        body.dark-mode #compute-homework-filters {
            background: rgba(15, 23, 42, 0.55) !important;
            border: 1px solid #334155 !important;
            border-radius: 12px;
            padding: 6px;
        }
        body.dark-mode #tasks-section .tab-content,
        body.dark-mode #activities-section .tab-content,
        body.dark-mode #block-homework-section .tab-content,
        body.dark-mode #compute-homework-section .tab-content,
        body.dark-mode #lessons-section .tab-content,
        body.dark-mode #leaderboard-list,
        body.dark-mode #quiz-list,
        body.dark-mode #top-students-list {
            background: transparent !important;
        }
        body.dark-mode #teacher-stats,
        body.dark-mode #activities-teacher-stats,
        body.dark-mode #block-homework-teacher-stats,
        body.dark-mode #compute-homework-teacher-stats,
        body.dark-mode #lessons-teacher-stats,
        body.dark-mode #class-chart-summary .pie-summary-item {
            background: rgba(30, 41, 59, 0.9) !important;
            border-color: #334155 !important;
            color: #e2e8f0 !important;
        }
        body.dark-mode #top-students-list .top-student-row,
        body.dark-mode #leaderboard-list .top-student-row,
        body.dark-mode #quiz-list .list-item {
            background: rgba(30, 41, 59, 0.9) !important;
            border-color: #334155 !important;
            box-shadow: none !important;
        }
        body.dark-mode #teacher-analytics .teacher-type-panel,
        body.dark-mode #teacher-analytics .teacher-pie-panel {
            background: linear-gradient(160deg, #0f172a 0%, #111827 100%) !important;
            border-color: #334155 !important;
            box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08);
        }
        body.dark-mode #teacher-analytics .teacher-type-wrap,
        body.dark-mode #teacher-analytics .teacher-pie-wrap {
            background: rgba(30, 41, 59, 0.45) !important;
            border-radius: 12px;
        }
        body.dark-mode #teacher-analytics .teacher-type-title,
        body.dark-mode #teacher-analytics .teacher-pie-title,
        body.dark-mode #teacher-analytics .pie-summary-label {
            color: #cbd5e1 !important;
        }

        /* Mobil uyumluluk */
        img, canvas { max-width: 100%; height: auto; }
        .modal-content { width: 92vw; max-width: 500px; }
        .modal-large { max-width: 92vw; }
        #open-menu { top: 12px; left: 12px; }
        #side-menu { max-width: 80vw; }
        #side-menu button { font-size: 16px; }
        .student-list-item { flex-wrap: wrap; gap: 8px; }
        .stats-grid { grid-template-columns: 1fr 1fr; }
        .stat-detail-grid { grid-template-columns: 1fr 1fr; }
          .chart-container { height: 180px; }
          #myTaskChart, #myActivityChart, #myBlockChart, #myComputeChart { width: 100% !important; max-width: 100% !important; height: 140px !important; display: block; }

        @media (max-width: 768px) {
            .container { width: 100%; max-width: 100%; margin: 0 auto; padding: 12px; overflow-x: hidden; }
            body { overflow-x: hidden !important; }
            #app-screen { width: 100%; max-width: 100%; overflow-x: hidden; }
            .card { border-radius: 10px; padding: 12px; }
            .tabs { flex-direction: column; }
            .tab-btn { width: 100%; }
            #student-homework-tabs,
            #student-apps-tabs {
                flex-direction: row !important;
            }
            #student-homework-tabs .tab-btn,
            #student-apps-tabs .tab-btn {
                width: auto !important;
                flex: 1 1 0;
            }
            .filter-bar { flex-direction: column; }
            .filter-btn { width: 100%; }
            .sidebar button { font-size: 16px; }
            .app-header { gap: 10px; flex-wrap: wrap; }
            .time-widget {
                width: 100%;
                justify-content: center;
                gap: 4px;
                padding: 4px 6px;
            }
            .time-block { padding: 1px 5px; }
            .time-val { font-size: 0.78rem; font-weight: 500; }
            .time-label { font-size: 0.64rem; font-weight: 400; }
            .login-card { width: 86vw; }
            .login-logo { width: 105px; }
            #students-modal .student-actions { margin-left: auto; width: auto; }
            
            .content-right-pane { min-width: 0; }
            #student-stats-bar { gap: 6px; }
            .teacher-top-wrap { grid-template-columns: 1fr; }
            .home-overview-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .lesson-builder-topbar { grid-template-columns: 1fr; }
            .lesson-builder-main { grid-template-columns: 1fr; }
            .lesson-quick-tools { grid-template-columns: 1fr; }
            .lesson-question-grid { grid-template-columns: 1fr; }
            #tasks-section,
            #activities-section,
            #quiz-section,
            #block-homework-section,
            #compute-homework-section,
            #lessons-section,
            #student-homework-shell,
            #student-apps-shell,
            #teacher-analytics,
            #leaderboard-section,
            #top-students-card {
                height: auto;
            }
            #app-screen.student-view > #student-homework-shell,
            #app-screen.student-view > #student-apps-shell,
            #app-screen.student-view > #leaderboard-section {
                height: 460px;
                min-height: 460px;
                overflow: hidden;
            }
            #app-screen.student-view #student-homework-combined .tab-content,
            #app-screen.student-view #student-apps-combined .tab-content,
            #app-screen.student-view #leaderboard-list {
                overflow: auto !important;
            }
            #student-stats-bar .stats-grid { grid-template-columns: 1fr; }
            .completed-summary { display: flex; flex-wrap: wrap; gap: 6px; }
            .completed-summary .item { flex: 1 1 calc(50% - 6px); min-width: 110px; }
            #my-stats-content .chart-container { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }

        /* Öğretmen ana sayfa: üstte 2 kolon, altta 3 kolon */
        @media (min-width: 1024px) {
            #app-screen.teacher-view {
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 12px;
            }
            #app-screen.teacher-view > .app-header {
                grid-column: 1 / -1;
            }
            #app-screen.teacher-view > #teacher-analytics {
                grid-column: span 2;
                margin-bottom: 0;
            }
            #app-screen.teacher-view > #top-students-card {
                grid-column: span 1;
                margin-bottom: 0;
            }
            #app-screen.teacher-view #tasks-section,
            #app-screen.teacher-view #activities-section,
            #app-screen.teacher-view #quiz-section,
            #app-screen.teacher-view #block-homework-section,
            #app-screen.teacher-view #compute-homework-section,
            #app-screen.teacher-view #lessons-section {
                grid-column: span 1;
                height: 430px;
            }
            /* Öğretmen ana sayfası kart sırası: Quiz ve Dersler yer değiştirildi */
            #app-screen.teacher-view #tasks-section { order: 1; }
            #app-screen.teacher-view #activities-section { order: 2; }
            #app-screen.teacher-view #lessons-section { order: 3; }
            #app-screen.teacher-view #block-homework-section { order: 4; }
            #app-screen.teacher-view #compute-homework-section { order: 5; }
            #app-screen.teacher-view #quiz-section { order: 6; }
            #app-screen.teacher-view #student-homework-shell,
            #app-screen.teacher-view #student-apps-shell {
                display: contents;
            }
            #app-screen.teacher-view .student-shell-head {
                display: none;
            }
            #teacher-analytics .stats-summary-grid {
                grid-template-columns: repeat(5, minmax(82px, 1fr)) !important;
                gap: 8px !important;
            }
            #teacher-analytics .stats-summary-grid .stat-card {
                padding: 8px;
            }
            #teacher-analytics .stats-summary-grid .stat-number {
                font-size: 1.32rem;
            }
            #teacher-analytics .stats-summary-grid .stat-label {
                font-size: 0.84rem;
            }
            #teacher-analytics .teacher-main-chart {
                height: 246px !important;
                min-height: 246px !important;
            }

            #app-screen.student-view {
                grid-template-columns: minmax(0, 1.25fr) minmax(0, 1.25fr) minmax(220px, 0.75fr);
                gap: 12px;
            }
            #app-screen.student-view > .app-header,
            #app-screen.student-view > #home-overview-strip,
            #app-screen.student-view > #student-stats-bar {
                grid-column: 1 / -1;
            }
            #app-screen.student-view > #student-homework-shell {
                grid-column: span 1;
                order: 1;
                height: 520px;
                min-height: 520px;
            }
            #app-screen.student-view > #student-apps-shell {
                grid-column: span 1;
                order: 2;
                height: 520px;
                min-height: 520px;
            }
            #app-screen.student-view > #leaderboard-section {
                grid-column: span 1;
                order: 3;
                height: 520px;
                min-height: 520px;
                justify-self: end;
                width: 100%;
            }
            #app-screen.student-view > .card {
                overflow: hidden;
            }
            #app-screen.student-view #student-homework-shell .tab-content,
            #app-screen.student-view #student-apps-shell .tab-content,
            #app-screen.student-view #leaderboard-list,
            #app-screen.student-view #quiz-list,
            #app-screen.student-view #top-students-list {
                overflow: hidden !important;
            }
        }
        

        @media (max-width: 480px) {
            .container { padding: 12px; }
            .form-control { font-size: 0.9rem; padding: 8px; }
            .btn { padding: 7px 9px; font-size: 0.85rem; }
            .list-item { flex-direction: column; align-items: flex-start; }
            .student-list-item { flex-direction: column; align-items: flex-start; }
            .stats-grid { grid-template-columns: 1fr; }
            .home-overview-strip { grid-template-columns: 1fr; }
            .stat-detail-grid { grid-template-columns: 1fr; }
            .chart-container { height: 170px; }
            .completed-summary .item { flex: 1 1 calc(50% - 6px); min-width: 96px; }
            #my-stats-content .chart-container { grid-template-columns: 1fr !important; }
            .login-screen { padding: 10px; }
            .login-card { width: 100%; min-height: auto; border-radius: 14px; }
            .login-layout { grid-template-columns: 1fr; min-height: auto; }
            .login-left { padding: 20px 16px 14px; gap: 14px; }
            .login-left-top h2 { font-size: 1.45rem; }
            .login-left-top p { font-size: 0.88rem; }
            .login-hero-logo { max-width: 180px; }
            .login-slogan { font-size: 0.88rem; }
            .login-right { padding: 18px 16px 22px; }
            .login-form-wrap { max-width: 100%; gap: 10px; }
            .login-form-wrap h3 { font-size: 1.3rem; }
            .login-form-wrap .login-sub { font-size: 0.88rem; margin-bottom: 6px; }
            #login-screen .form-control, #btn-login { height: 46px; }
            #login-screen .btn { width: 100%; }
        }
        @media (max-width: 360px) {
            .login-left-top h2 { font-size: 1.25rem; }
            .login-hero-logo { max-width: 150px; }
            .login-slogan { font-size: 0.82rem; }
            .login-form-wrap h3 { font-size: 1.16rem; }
        }
        .apps-hub-modal-content {
            width: min(1400px, 96vw);
            max-width: none;
            max-height: 92vh;
            overflow: auto;
            border-radius: 20px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
        }
        .apps-hub-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 14px;
        }
        .apps-hub-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 18px;
        }
        .apps-hub-card {
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 18px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-height: 330px;
        }
        .apps-hub-card-image {
            width: 100%;
            aspect-ratio: 1 / 1;
            object-fit: cover;
            border-radius: 14px;
            background: #e2e8f0;
            margin-bottom: 10px;
        }
        .apps-hub-card h4 {
            margin: 2px 0 8px;
            font-size: 26px;
            line-height: 1.1;
            color: #111827;
        }
        .apps-hub-card p {
            margin: 0 0 14px;
            color: #6b7280;
        }
        .apps-hub-start-btn {
            width: 100%;
            margin-top: auto;
            border-radius: 12px;
        }
        body.dark-mode .apps-hub-modal-content { background: #0f172a; border-color: #334155; }
        body.dark-mode .apps-hub-card { background: #111827; border-color: #334155; }
        body.dark-mode .apps-hub-card h4 { color: #f8fafc; }
        body.dark-mode .apps-hub-card p { color: #cbd5e1; }
    </style>
</head>
<body>

    <button id="open-menu" style="display:none; position: fixed; top: 20px; left: 20px; z-index: 900; background: #ffffff; color: #0f172a; border: 1px solid #dbe5f1; box-shadow: 0 8px 24px rgba(15,23,42,0.12); padding: 10px 15px; border-radius: 10px; cursor: pointer; font-size: 20px;">☰</button>

    <div id="side-menu" class="sidebar">
        <button id="close-menu" style="font-size: 30px; margin-bottom: 20px;">×</button>
        <div class="sidebar-logo-wrap">
            <img src="logo.png" alt="Logo" class="sidebar-logo">
        </div>
        <button id="btn-open-home" onclick="showPage('home')" class="nav-btn active" data-page="home">🏠 Anasayfa</button>
        <button id="btn-open-lessons" class="nav-btn" style="display: none;">📚 Derslerim</button>
        <button id="btn-open-live-quiz" class="nav-btn" style="display: none;">🧠 Canlı Quiz</button>
        <button id="btn-toggle-tasks-menu" class="nav-btn sidebar-group-toggle" style="display: none;">🗂️ Ödevler <span class="arrow">▸</span></button>
        <div id="submenu-tasks" class="sidebar-submenu">
            <button id="btn-open-create" class="nav-btn submenu-item" style="display: none;">➕ Ödev Ekle</button>
            <button id="btn-open-tasks" class="nav-btn submenu-item" style="display: none;">🗂️ Ödevler</button>
            <button id="btn-open-approvals" class="nav-btn submenu-item" style="display: none;">✅ Ödev Onayları</button>
        </div>
        <button id="btn-toggle-add-menu" class="nav-btn sidebar-group-toggle" style="display: none;">➕ Ekle <span class="arrow">▸</span></button>
        <div id="submenu-add" class="sidebar-submenu">
            <button id="btn-open-content" class="nav-btn submenu-item" style="display: none;">🧩 Etkinlik Ekle</button>
            <button id="btn-open-books" class="nav-btn submenu-item" style="display: none;">📚 Kitap Ekle</button>
            <button id="btn-open-add-student" class="nav-btn submenu-item" style="display: none;">👤 Öğrenci Ekle</button>
        </div>
        <button id="btn-toggle-apps-menu" class="nav-btn sidebar-group-toggle" style="display: none;">🧠 Uygulamalarım</button>
        <div id="submenu-apps" class="sidebar-submenu" style="display:none;"></div>
        <button id="btn-toggle-student-data-menu" class="nav-btn sidebar-group-toggle" style="display: none;">👥 Öğrenci Verileri <span class="arrow">▸</span></button>
        <div id="submenu-student-data" class="sidebar-submenu">
            <button id="btn-open-students" class="nav-btn submenu-item" style="display: none;">👥 Öğrencilerim</button>
            <button id="btn-open-classes" class="nav-btn submenu-item" style="display: none;">🏫 Sınıflarım</button>
            <button id="btn-open-reports" class="nav-btn submenu-item" style="display: none;">🧾 Raporlar</button>
            <button id="btn-open-login-cards" class="nav-btn submenu-item" style="display: none;">🪪 Giriş Kartları</button>
            <button id="btn-open-teacher-certificates" class="nav-btn submenu-item" style="display: none;">🏅 Sertifika Yönetimi</button>
        </div>
        <button id="btn-open-my-stats" class="nav-btn" style="display: none;">📈 İstatistiklerim</button>
        <button id="btn-open-certificates" class="nav-btn" style="display: none;">🏅 Sertifikalarım</button>
        <button id="btn-open-avatar-shop" class="nav-btn" style="display: none;">🛍️ Avatar Al</button>
        <div class="sidebar-footer">
            <div class="sidebar-footer-title">Sitede Geçen Süren</div>
            <div id="student-total-time" class="time-widget" style="display:none;">
                <div class="time-block">
                    <div id="time-days" class="time-val">0</div>
                    <div class="time-label">Gün</div>
                </div>
                <div class="time-block">
                    <div id="time-hours" class="time-val">0</div>
                    <div class="time-label">Saat</div>
                </div>
                <div class="time-block">
                    <div id="time-mins" class="time-val">0</div>
                    <div class="time-label">Dk</div>
                </div>
                <div class="time-block">
                    <div id="time-secs" class="time-val">0</div>
                    <div class="time-label">Sn</div>
                </div>
            </div>
            <button id="btn-logout-side" class="nav-btn" style="color:#b91c1c;">🚪 Çıkış Yap</button>
        </div>
    </div>

    <div id="apps-hub-modal" class="modal-overlay" style="display:none; z-index:26000;">
        <div class="modal-content apps-hub-modal-content">
            <div class="apps-hub-head">
                <h3 style="margin:0;">Uygulamalarım</h3>
                <button id="btn-close-apps-hub" class="btn" style="background:#e2e8f0;">Kapat</button>
            </div>
            <div class="apps-hub-grid">
                <article class="apps-hub-card">
                    <img src="blok-kodlama.png" alt="Blok Kodlama" class="apps-hub-card-image">
                    <h4>Blok Kodlama</h4>
                    <p>Bloklarla temel kodlama becerilerini geliştir.</p>
                    <button id="btn-apps-hub-open-block2d" class="btn btn-primary apps-hub-start-btn">Uygulamaya Başla</button>
                </article>
                <article class="apps-hub-card">
                    <img src="3d-blok-kodlama.png" alt="3D Blok Kodlama" class="apps-hub-card-image">
                    <h4>3D Blok Kodlama</h4>
                    <p>3 boyutlu sahnede kodlamayı deneyimle.</p>
                    <button id="btn-apps-hub-open-block3d" class="btn btn-primary apps-hub-start-btn">Uygulamaya Başla</button>
                </article>
                <article class="apps-hub-card">
                    <img src="compute-it.png" alt="Compute It" class="apps-hub-card-image">
                    <h4>Compute It</h4>
                    <p>Algoritma ve problem çözme becerini güçlendir.</p>
                    <button id="btn-apps-hub-open-compute" class="btn btn-primary apps-hub-start-btn">Uygulamaya Başla</button>
                </article>
                <article class="apps-hub-card">
                    <img src="flowchart.png" alt="Flowchart" class="apps-hub-card-image">
                    <h4>Flowchart</h4>
                    <p>Akış şeması ile mantıksal düşünmeyi pekiştir.</p>
                    <button id="btn-apps-hub-open-flowchart" class="btn btn-primary apps-hub-start-btn">Uygulamaya Başla</button>
                </article>
                <article class="apps-hub-card">
                    <img src="cizgi-oyunu.png" alt="Çizgi Oyunu" class="apps-hub-card-image">
                    <h4>Çizgi Oyunu</h4>
                    <p>Refleks ve dikkat becerilerini eğlenceli şekilde test et.</p>
                    <button id="btn-apps-hub-open-line-trace" class="btn btn-primary apps-hub-start-btn">Uygulamaya Başla</button>
                </article>
            </div>
        </div>
    </div>

    <div id="avatar-shop-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content avatar-shop-modal-content">
            <div class="avatar-shop-top">
                <h3 style="margin: 0;">Avatar Al</h3>
                <div id="avatar-shop-current-xp" class="avatar-shop-xp">XP: 0</div>
            </div>
            <div id="avatar-shop-grid" class="avatar-shop-grid"></div>
            <div style="display:flex; justify-content:flex-end;">
                <button id="btn-close-avatar-shop" class="btn btn-warning">Kapat</button>
            </div>
        </div>
    </div>
    <button id="student-ai-fab" class="edu-ai-fab" title="Yapay Zeka Asistanı">
        <span class="edu-ai-wing left" aria-hidden="true"></span>
        <span class="edu-ai-core"><img src="logo.png" alt="Asistan Avatar"></span>
        <span class="edu-ai-wing right" aria-hidden="true"></span>
    </button>
    <div id="student-ai-panel" class="edu-ai-panel">
        <div class="edu-ai-panel-head">
            <div>
                <h4 class="edu-ai-panel-title">Akıllı Öğrenci Asistanı</h4>
                <p class="edu-ai-panel-sub">Sadece platform içerikleri için cevap verir.</p>
            </div>
            <button id="student-ai-close" class="edu-ai-close" title="Kapat">×</button>
        </div>
        <div id="student-ai-messages" class="edu-ai-messages"></div>
        <div class="edu-ai-quick">
            <button type="button" data-ai-quick="Bugün hangi ödevlerim var?">Ödevlerim</button>
            <button type="button" data-ai-quick="Blok kodlama ödev durumum nedir?">Blok Durumu</button>
            <button type="button" data-ai-quick="Compute it ödevlerimi özetle">Compute Özet</button>
            <button type="button" data-ai-quick="Ders içeriklerimde hangi konular var?">Ders Konuları</button>
        </div>
        <div class="edu-ai-input-wrap">
            <input id="student-ai-input" class="edu-ai-input" type="text" placeholder="Sorunu yaz...">
            <button id="student-ai-send" class="edu-ai-send" type="button">Gönder</button>
        </div>
    </div>

    <!-- Giriş Ekranı -->
    <div id="login-screen" class="login-screen">
        <div class="card login-card">
            <div class="login-layout">
                <section class="login-left">
                    <div class="login-left-top">
                        <h2>Dijital Bilişim Eğitim Platformu</h2>
                        <p>Yeni şeyler öğrenmek için doğru yerdesin.</p>
                    </div>
                    <img src="logo.png" alt="Logo" class="login-hero-logo">
                    <div class="login-slogan">Özelsin Çünkü Gelecek Sensin</div>
                </section>
                <section class="login-right">
                    <div class="login-form-wrap">
                        <h3>Giriş Yap</h3>
                        <p class="login-sub">Hesabınla devam etmek için bilgilerini gir.</p>
                        <label for="email">Kullanıcı Adı / E-posta</label>
                        <input type="text" id="email" class="form-control" placeholder="E-posta veya Kullanıcı Adı">
                        <label for="password">Şifre</label>
                        <input type="password" id="password" class="form-control" placeholder="Şifre">
                        <div class="login-actions">
                            <button id="btn-login" type="button" class="btn btn-success" style="flex: 1;">Giriş Yap</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>

        <!-- Block Runner Reports Modal (Teacher) -->
        <div id="block-reports-modal" class="modal-overlay" style="display:none;">
            <div class="modal-content modal-large">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">Blok Kodlama Raporları</h3>
                    <button id="btn-close-block-reports" class="btn" style="background:#eee;">Kapat</button>
                </div>
                <div style="margin-top:12px;">
                    <div id="block-reports-loading" class="loading">Yükleniyor...</div>
                    <div id="block-reports-list" style="display:none; max-height:60vh; overflow:auto; margin-top:8px;"></div>
                </div>
            </div>
        </div>

    <div class="container">

        <!-- Ana Uygulama Ekranı -->
        <div id="app-screen" style="display: none;">
            <div class="app-header">
                <div id="user-fullname" style="min-width: 160px; font-family: 'Poppins', sans-serif; font-weight: 600; color: #2c2c2c;"></div>
                <button id="theme-toggle-app" class="theme-toggle-inline" type="button" title="Karanlık Mod">🌙</button>
                <h3 id="user-welcome" style="margin: 0; display:none;">Hoş geldin!</h3>
                <div id="user-menu" style="position: relative; display: flex; align-items: center; gap: 8px;">
                    <div id="user-header-avatar" aria-hidden="true"></div>
                    <button id="user-menu-trigger" class="btn">Hoş geldin</button>
                    <div id="user-dropdown" style="position: absolute; top: 44px; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 24px rgba(0,0,0,0.12); min-width: 160px; display: none; z-index: 12000;">
                        <button id="btn-open-profile-menu" class="btn" style="width: 100%; text-align: left; background: transparent; border: none; padding: 10px 12px;">👤 Profil</button>
                        <button id="btn-logout-menu" class="btn" style="width: 100%; text-align: left; background: transparent; border: none; padding: 10px 12px; color: #b91c1c;">🚪 Çıkış Yap</button>
                    </div>
                </div>
            </div>
            <div id="home-overview-strip" class="home-overview-strip">
                <div class="home-overview-card">
                    <div class="home-overview-title">Ödev</div>
                    <div id="home-overview-tasks" class="home-overview-value">0</div>
                    <div id="home-overview-tasks-meta" class="home-overview-meta">Yükleniyor...</div>
                </div>
                <div class="home-overview-card">
                    <div class="home-overview-title">Etkinlik</div>
                    <div id="home-overview-activities" class="home-overview-value">0</div>
                    <div id="home-overview-activities-meta" class="home-overview-meta">Yükleniyor...</div>
                </div>
                <div class="home-overview-card">
                    <div class="home-overview-title">Blok Kodlama</div>
                    <div id="home-overview-block" class="home-overview-value">0</div>
                    <div id="home-overview-block-meta" class="home-overview-meta">Yükleniyor...</div>
                </div>
                <div class="home-overview-card">
                    <div class="home-overview-title">Compute It</div>
                    <div id="home-overview-compute" class="home-overview-value">0</div>
                    <div id="home-overview-compute-meta" class="home-overview-meta">Yükleniyor...</div>
                </div>
                <div class="home-overview-card">
                    <div class="home-overview-title">Ders</div>
                    <div id="home-overview-lessons" class="home-overview-value">0</div>
                    <div id="home-overview-lessons-meta" class="home-overview-meta">Yükleniyor...</div>
                </div>
            </div>
            <!-- Öğrenci İstatistikleri -->
            <div id="student-stats-bar" style="display: none;">
                <div class="stats-grid" style="margin-bottom: 12px;">
                    <div class="stat-card completed-card">
                        <div class="stat-label" style="font-size:0.92rem;font-weight:700;color:#1f2937;">Tamamlananlar</div>
                        <div class="completed-summary">
                            <div class="item">
                                <div class="k">Ödev</div>
                                <div class="v" id="stat-completed">0</div>
                            </div>
                            <div class="item">
                                <div class="k">Etkinlik</div>
                                <div class="v" id="stat-activity-completed">0</div>
                            </div>
                            <div class="item">
                                <div class="k">Blok Kod</div>
                                <div class="v" id="stat-block-level-completed">0</div>
                            </div>
                            <div class="item">
                                <div class="k">Compute It</div>
                                <div class="v" id="stat-compute-level-completed">0</div>
                            </div>
                            <div class="item">
                                <div class="k">3D Blok</div>
                                <div class="v" id="stat-block3d-completed">0</div>
                            </div>
                            <div class="item">
                                <div class="k">Flowchart</div>
                                <div class="v" id="stat-flowchart-completed">0</div>
                            </div>
                            <div class="item">
                                <div class="k">Derslerim</div>
                                <div class="v" id="stat-lessons-completed">0</div>
                            </div>
                            <div class="item xp-item">
                                <div class="k">Toplam XP</div>
                                <div class="v" id="user-xp">0 XP</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <!-- central student open button removed per UI change -->
                </div>
            </div>

            <!-- Öğretmen İstatistikleri ve Öğrenci Listesi -->
            <div id="teacher-analytics" style="display: none;">
                <div id="stats-loading" class="loading">Yükleniyor...</div>
                <div id="stats-content" style="display: none;">
                    <div class="card">
                        <h4>Sınıf Genel İstatistikleri</h4>
                        <div class="stats-grid stats-summary-grid" style="grid-template-columns: repeat(auto-fit, minmax(110px,1fr)); gap:10px; margin-bottom:12px;">
                            <div class="stat-card">
                                <div class="stat-number" id="stats-total-students">0</div>
                                <div class="stat-label">Toplam Öğrenci</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="stats-active-students">0</div>
                                <div class="stat-label">Aktif Öğrenci</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="stats-avg-completion">0%</div>
                                <div class="stat-label">Ortalama Tamamlama</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="stats-total-completions">0</div>
                                <div class="stat-label">Toplam Tamamlama</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="stats-total-xp">0</div>
                                <div class="stat-label">Toplam XP</div>
                            </div>
                        </div>
                        <div class="teacher-top-wrap">
                            <div class="chart-container teacher-type-chart" style="margin: 0;">
                                <div class="teacher-type-panel">
                                    <div class="teacher-type-title">Kategori Bazlı Tamamlama Oranı</div>
                                    <div class="teacher-type-wrap">
                                        <canvas id="classTypeChart"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="chart-container teacher-main-chart" style="margin: 0;">
                                <div class="teacher-pie-panel">
                                    <div class="teacher-pie-title">Ödev Tamamlanma Analizi</div>
                                    <div class="teacher-pie-wrap">
                                        <canvas id="classChart"></canvas>
                                    </div>
                                    <div id="class-chart-summary"></div>
                                </div>
                            </div>
                        </div>
                            <!-- teacher homepage block reports button removed (reports available in student reports view) -->
                    </div>
                    
                </div>
            </div>

            <!-- Öğrenci Başarı Listesi (Öğretmen) -->
            <div class="card" id="top-students-card" style="display: none;">
                <h4>Öğrenci Başarı Listesi (İlk 5)</h4>
                <div id="top-students-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>

            <div class="card" id="student-homework-shell">
                <div class="student-shell-head">
                    <h3>📚 Ödevlerim</h3>
                    <p>Ödev, etkinlik ve ders içeriklerin tek alanda listelenir.</p>
                </div>
                <div id="student-homework-combined" class="student-combined-wrap">
                    <div id="student-homework-tabs" class="tabs">
                        <button class="tab-btn active" onclick="switchStudentCombinedTab('homework','pending')">Bekleyen</button>
                        <button class="tab-btn" onclick="switchStudentCombinedTab('homework','completed')">Tamamlanan</button>
                    </div>
                    <div id="student-homework-pending" class="tab-content active">
                        <ul id="list-student-homework-pending" style="padding:0; margin:0; list-style:none;"></ul>
                        <div id="no-student-homework-pending" class="empty-state" style="display:none;">
                            <div class="empty-state-icon">📚</div>
                            Bekleyen içerik yok.
                        </div>
                    </div>
                    <div id="student-homework-completed" class="tab-content">
                        <ul id="list-student-homework-completed" style="padding:0; margin:0; list-style:none;"></ul>
                        <div id="no-student-homework-completed" class="empty-state" style="display:none;">
                            <div class="empty-state-icon">✅</div>
                            Tamamlanan içerik yok.
                        </div>
                    </div>
                    <button id="btn-show-all-student-homework" class="btn btn-primary" style="width:100%; display:none; margin-top:10px;">Daha Fazla Göster</button>
                </div>
                <div class="student-shell-body">
            <!-- Verilen Ödevler / Ödevlerim -->
            <div class="card" id="tasks-section">
                <h3 id="tasks-title">📚 Ödevlerim</h3>
                
                <!-- Filtreleme (Öğretmen için) -->
                <div id="teacher-filters" class="filter-bar" style="display: none;">
                </div>
                
                <!-- Öğrenci için sekmeler -->
                <div id="student-tabs" class="tabs" style="display: none;">
                    <button class="tab-btn active" onclick="switchTab('pending')">Bekleyen</button>
                    <button class="tab-btn" onclick="switchTab('completed')">Tamamlanan</button>
                </div>
                
                <!-- Öğretmen için istatistikler -->
                <div id="teacher-stats" style="display: none; margin-bottom: 15px; padding: 10px; background: #f0f7ff; border-radius: 8px; text-align: center;">
                    <small>Verilen Toplam Ödev: <strong id="teacher-task-count">0</strong></small>
                </div>
                
                <div id="tab-pending" class="tab-content active">
                    <ul id="list-pending" style="padding: 0; margin: 0; list-style: none;"></ul>
                    <div id="no-pending" class="empty-state" style="display: none;">
                        <div class="empty-state-icon">⏳</div>
                        <div>Bekleyen ödev yok!</div>
                    </div>
                </div>
                
                <div id="tab-completed" class="tab-content">
                    <ul id="list-completed" style="padding: 0; margin: 0; list-style: none;"></ul>
                    <div id="no-completed" class="empty-state" style="display: none;">
                        <div class="empty-state-icon">📚</div>
                        <div>Henüz tamamlanan ödev yok.</div>
                    </div>
                </div>
                <button id="btn-show-all-tasks" class="btn btn-primary" style="width: 100%; display: none; margin-top: 10px;">Daha Fazla Göster</button>
            </div>

            <!-- Etkinliklerim / Verilen Etkinlikler -->
            <div class="card" id="activities-section">
                <h3 id="activities-title">🎯 Etkinliklerim</h3>

                <!-- Filtreleme (Öğretmen için) -->
                <div id="activity-filters" class="filter-bar" style="display: none;">
                </div>
                
                <div id="activities-tabs" class="tabs" style="display: none;">
                    <button class="tab-btn active" onclick="switchActivityTab('pending')">Bekleyen</button>
                    <button class="tab-btn" onclick="switchActivityTab('completed')">Tamamlanan</button>
                </div>
                
                <div id="activities-teacher-stats" style="display: none; margin-bottom: 15px; padding: 10px; background: #f0f7ff; border-radius: 8px; text-align: center;">
                    <small>Verilen Toplam Etkinlik: <strong id="teacher-activity-count">0</strong></small>
                </div>

                <div id="activity-pending" class="tab-content active">
                    <ul id="list-activity-pending" style="padding: 0; margin: 0; list-style: none;"></ul>
                    <div id="no-activity-pending" class="empty-state" style="display: none;">
                        <div class="empty-state-icon">🎯</div>
                        Bekleyen etkinlik yok.
                    </div>
                </div>
                
                <div id="activity-completed" class="tab-content">
                    <ul id="list-activity-completed" style="padding: 0; margin: 0; list-style: none;"></ul>
                    <div id="no-activity-completed" class="empty-state" style="display: none;">
                        <div class="empty-state-icon">✅</div>
                        Tamamlanan etkinlik yok.
                    </div>
                </div>
                <button id="btn-show-all-activities" class="btn btn-primary" style="width: 100%; display: none; margin-top: 10px;">Daha Fazla Göster</button>
            </div>
            
            <!-- Dersler -->
            <div class="card" id="lessons-section">
                <h3 id="lessons-title">📑 Derslerim</h3>
                <div id="lessons-tabs" class="tabs" style="display:none; margin-top:10px;">
                    <button class="tab-btn active" onclick="switchLessonTab('pending')">Bekleyen</button>
                    <button class="tab-btn" onclick="switchLessonTab('completed')">Tamamlanan</button>
                </div>
                <div id="lessons-teacher-stats" style="display:none; margin:10px 0 15px; padding:10px; background:#f0f7ff; border-radius:8px; text-align:center;">
                    <small>Toplam Ders: <strong id="teacher-lesson-count">0</strong></small>
                </div>
                <div id="lessons-pending" class="tab-content active">
                    <ul id="list-lessons-pending" style="padding:0; margin:0; list-style:none;"></ul>
                    <div id="no-lessons-pending" class="empty-state" style="display:none;">
                        <div class="empty-state-icon">📖</div>
                        Bekleyen ders yok.
                    </div>
                </div>
                <div id="lessons-completed" class="tab-content">
                    <ul id="list-lessons-completed" style="padding:0; margin:0; list-style:none;"></ul>
                    <div id="no-lessons-completed" class="empty-state" style="display:none;">
                        <div class="empty-state-icon">✅</div>
                        Tamamlanan ders yok.
                    </div>
                </div>
                <button id="btn-show-all-lessons" class="btn btn-primary" style="width: 100%; display: none; margin-top: 10px;">Daha Fazla Göster</button>
            </div>
                </div>
            </div>

            <!-- Quizler (Öğretmen) -->
            <div class="card" id="quiz-section" style="display:none;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <h3 style="margin:0;">🧠 Verilen Quizler</h3>
                    <button id="btn-open-live-quiz-home" class="btn btn-primary">Quiz Yönet</button>
                </div>
                <div style="margin:10px 0 15px; padding:10px; background:#f0f7ff; border-radius:8px; text-align:center;">
                    <small>Toplam Quiz: <strong id="teacher-quiz-count">0</strong></small>
                </div>
                <div id="quiz-list" style="display:flex;flex-direction:column;gap:8px;"></div>
            </div>

            <div class="card" id="student-apps-shell">
                <div class="student-shell-head">
                    <h3>🧩 Uygulamalar</h3>
                    <p>Blok Kodlama, 3D Blok Kodlama, Flowchart, Çizgi Oyunu ve Compute It içerikleri.</p>
                </div>
                <div id="student-apps-combined" class="student-combined-wrap">
                    <div id="student-apps-tabs" class="tabs">
                        <button class="tab-btn active" onclick="switchStudentCombinedTab('apps','pending')">Bekleyen</button>
                        <button class="tab-btn" onclick="switchStudentCombinedTab('apps','completed')">Tamamlanan</button>
                    </div>
                    <div id="student-apps-pending" class="tab-content active">
                        <ul id="list-student-apps-pending" style="padding:0; margin:0; list-style:none;"></ul>
                        <div id="no-student-apps-pending" class="empty-state" style="display:none;">
                            <div class="empty-state-icon">🧩</div>
                            Bekleyen uygulama içeriği yok.
                        </div>
                    </div>
                    <div id="student-apps-completed" class="tab-content">
                        <ul id="list-student-apps-completed" style="padding:0; margin:0; list-style:none;"></ul>
                        <div id="no-student-apps-completed" class="empty-state" style="display:none;">
                            <div class="empty-state-icon">✅</div>
                            Tamamlanan uygulama içeriği yok.
                        </div>
                    </div>
                    <button id="btn-show-all-student-apps" class="btn btn-primary" style="width:100%; display:none; margin-top:10px;">Daha Fazla Göster</button>
                </div>
                <div class="student-shell-body">
            <!-- Blok Kodlama Ödevi -->
            <div class="card" id="block-homework-section">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <h3 id="block-homework-title" style="margin:0;">🧩 3D & Blok Code Ödevleri</h3>
                    <button id="btn-create-block-homework" class="btn btn-primary" style="display:none; white-space:nowrap;">Ödev Ver</button>
                </div>
                <div id="block-homework-assign-tabs" class="tabs" style="display:none; margin-top:10px;">
                    <button class="tab-btn active" onclick="switchBlockAssignTab('block2d')">Blok Kodlama</button>
                    <button class="tab-btn" onclick="switchBlockAssignTab('block3d')">3D Blok Kodlama</button>
                </div>
                <div id="block-homework-tabs" class="tabs" style="display:none; margin-top:10px;">
                    <button class="tab-btn active" onclick="switchBlockHomeworkTab('pending')">Bekleyen</button>
                    <button class="tab-btn" onclick="switchBlockHomeworkTab('completed')">Tamamlanan</button>
                </div>
                <div id="block-homework-teacher-stats" style="display:none; margin:10px 0 15px; padding:10px; background:#f0f7ff; border-radius:8px; text-align:center;">
                    <small>Verilen Toplam Blok Ödevi: <strong id="teacher-block-homework-count">0</strong></small>
                </div>
                <div id="block-homework-filters" class="filter-bar" style="display:none;">
                </div>
                <div id="block-homework-pending" class="tab-content active">
                    <ul id="list-block-homework-pending" style="padding:0; margin:0; list-style:none;"></ul>
                    <div id="no-block-homework-pending" class="empty-state" style="display:none;">
                        <div class="empty-state-icon">🧩</div>
                        Bekleyen blok kodlama ödevi yok.
                    </div>
                </div>
                <div id="block-homework-completed" class="tab-content">
                    <ul id="list-block-homework-completed" style="padding:0; margin:0; list-style:none;"></ul>
                    <div id="no-block-homework-completed" class="empty-state" style="display:none;">
                        <div class="empty-state-icon">✅</div>
                        Tamamlanan blok kodlama ödevi yok.
                    </div>
                </div>
                <button id="btn-show-all-block-homework" class="btn btn-primary" style="width: 100%; display: none; margin-top: 10px;">Daha Fazla Göster</button>
            </div>

            <!-- Compute It Ödevi -->
            <div class="card" id="compute-homework-section">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <h3 id="compute-homework-title" style="margin:0;">🧠 Compute It Ödevi</h3>
                    <button id="btn-create-compute-homework" class="btn btn-primary" style="display:none; white-space:nowrap;">Ödev Ver</button>
                </div>
                <div id="compute-homework-tabs" class="tabs" style="display:none; margin-top:10px;">
                    <button class="tab-btn active" onclick="switchComputeHomeworkTab('pending')">Bekleyen</button>
                    <button class="tab-btn" onclick="switchComputeHomeworkTab('completed')">Tamamlanan</button>
                </div>
                <div id="compute-homework-teacher-stats" style="display:none; margin:10px 0 15px; padding:10px; background:#f0f7ff; border-radius:8px; text-align:center;">
                    <small>Verilen Toplam Compute It Ödevi: <strong id="teacher-compute-homework-count">0</strong></small>
                </div>
                <div id="compute-homework-filters" class="filter-bar" style="display:none;">
                </div>
                <div id="compute-homework-pending" class="tab-content active">
                    <ul id="list-compute-homework-pending" style="padding:0; margin:0; list-style:none;"></ul>
                    <div id="no-compute-homework-pending" class="empty-state" style="display:none;">
                        <div class="empty-state-icon">🧠</div>
                        Bekleyen Compute It ödevi yok.
                    </div>
                </div>
                <div id="compute-homework-completed" class="tab-content">
                    <ul id="list-compute-homework-completed" style="padding:0; margin:0; list-style:none;"></ul>
                    <div id="no-compute-homework-completed" class="empty-state" style="display:none;">
                        <div class="empty-state-icon">✅</div>
                        Tamamlanan Compute It ödevi yok.
                    </div>
                </div>
                <button id="btn-show-all-compute-homework" class="btn btn-primary" style="width: 100%; display: none; margin-top: 10px;">Daha Fazla Göster</button>
            </div>
                </div>
            </div>

            <div id="teacher-lessons-modal" class="modal-overlay" style="display:none; z-index:23000;">
                <div class="modal-content modal-large" style="width:min(96vw,1400px); height:92vh; max-width:none; display:flex; flex-direction:column;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px; margin-bottom:10px;">
                        <h2 style="margin:0;">📖 Derslerim</h2>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <button id="btn-open-lesson-builder-from-modal" class="btn btn-primary">Ders Oluştur</button>
                            <button id="btn-close-teacher-lessons-modal" class="btn" style="background:#e2e8f0;">Kapat</button>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
                        <button id="btn-teacher-lessons-filter-all" class="btn btn-primary" type="button">Tümü</button>
                        <button id="btn-teacher-lessons-filter-draft" class="btn" type="button" style="background:#fff7ed;color:#9a3412;">Taslak</button>
                        <button id="btn-teacher-lessons-filter-published" class="btn" type="button" style="background:#dcfce7;color:#166534;">Yayında</button>
                    </div>
                    <div id="teacher-lessons-modal-meta" style="font-size:13px;color:#64748b;margin-bottom:8px;"></div>
                    <div style="flex:1;min-height:0;overflow:auto;">
                        <ul id="teacher-lessons-modal-list" style="padding:0; margin:0; list-style:none; display:flex; flex-direction:column; gap:8px;"></ul>
                        <div id="teacher-lessons-modal-empty" class="empty-state" style="display:none;">
                            <div class="empty-state-icon">📌</div>
                            Ders bulunamadı.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Liderlik Tablosu (Öğrenci) -->
            <div class="card" id="leaderboard-section">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                    <h3 style="margin:0;">🏆 Liderlik Tablosu</h3>
                </div>
                <ul id="leaderboard-list" style="padding: 0; list-style: none;"></ul>
            </div>

        </div>

        <div id="leaderboard-modal" class="modal-overlay" style="display:none; z-index:21000;">
            <div class="modal-content modal-large" style="max-width:980px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <h2 style="margin:0;">Başarı Listesi</h2>
                    <button id="btn-close-leaderboard-modal" class="btn" style="background:#eee;">Kapat</button>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
                    <select id="leaderboard-filter-class" class="form-control" style="max-width:170px;">
                        <option value="">Tüm Sınıflar</option>
                    </select>
                    <select id="leaderboard-filter-section" class="form-control" style="max-width:170px;">
                        <option value="">Tüm Şubeler</option>
                    </select>
                </div>
                <div id="leaderboard-modal-list" style="max-height:520px; overflow:auto; display:flex; flex-direction:column; gap:8px;"></div>
            </div>
        </div>

        <!-- Aktivite Detay Ekranı -->
        <div id="activity-detail" style="display: none;" class="card">
            <button id="btn-back" class="btn btn-primary" style="margin-bottom: 20px;">↩️ Vazgeç ve Geri Dön</button>
            <div class="progress-bar"><div id="game-progress" class="progress-fill" style="width: 0%"></div></div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 id="detail-title" style="margin: 0;"></h2>
                <span class="time-badge" id="game-timer">⏱️ 00:00</span>
            </div>
            <div id="dynamic-game-container"></div>
            <div id="game-results" style="display: none; text-align: center; padding: 20px;">
                <h3 style="color: var(--success);">🎉 Tebrikler!</h3>
                <p id="result-text"></p>
                <div id="time-result" style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px;"></div>
            </div>
            <button id="btn-complete" class="btn btn-success" style="width: 100%; display: none; margin-top: 20px;">Kaydet ve Bitir</button>
        </div>
    </div>

    <!-- Görev Modal -->
    <div id="task-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <h2 id="modal-display-title"></h2>
            <p id="modal-display-desc"></p>
            
            <div id="modal-deadline" style="display: none; margin: 10px 0; padding: 8px; background: #fff3cd; border-radius: 8px; text-align: center; font-size: 0.9rem;">
                <strong>Son Teslim:</strong> <span id="modal-deadline-text"></span>
            </div>
            
            <div id="modal-stats" style="display: none; background: #f8f9fa; padding: 10px; border-radius: 8px; margin: 15px 0; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Tamamlayan: <strong id="modal-completed-count">0</strong> öğrenci</span>
                    <span>Ortalama Başarı: <strong id="modal-avg-score">0%</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Ortalama Süre: <strong id="modal-avg-time">0 dk</strong></span>
                    <span>En Hızlı: <strong id="modal-best-time">-</strong></span>
                </div>
            </div>
            
            <div id="teacher-actions" style="display: none; gap: 10px; margin-bottom: 10px;">
                <button id="btn-edit-task" class="btn btn-primary" style="flex: 1;">✏️ Düzenle</button>
                <button id="btn-delete-task" class="btn btn-danger" style="flex: 1;">🗑️ Sil</button>
            </div>
            <div id="book-approval-section" style="display:none; margin-bottom:10px; padding:10px; background:#f8fafc; border-radius:8px; border:1px solid #e5e7eb;">
                <div id="book-approval-title" style="font-weight:600; margin-bottom:6px;">📘 Kitap/Test Ödevi Onayı</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                    <select id="book-approve-class" class="form-control" style="max-width:160px;">
                        <option value="">Sınıf</option>
                    </select>
                    <select id="book-approve-section" class="form-control" style="max-width:160px;">
                        <option value="">Şube</option>
                    </select>
                </div>
                <div id="book-approval-list" style="max-height:220px; overflow-y:auto;"></div>
                <button id="btn-book-approve" class="btn btn-success" style="width:100%; margin-top:8px;">Seçilenleri Onayla</button>
            </div>
            
            <div id="edit-section" class="edit-section" style="display: none;">
                <h4>Ödevi Düzenle</h4>
                <input type="text" id="edit-title" class="form-control" placeholder="Yeni Başlık">
                <input type="text" id="edit-desc" class="form-control" placeholder="Yeni Açıklama">
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <div style="flex:1;">
                        <label><small>Kitap (Opsiyonel):</small></label>
                        <select id="edit-book" class="form-control">
                            <option value="">Kitap seçiniz</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label><small>Test (Opsiyonel):</small></label>
                        <select id="edit-book-test" class="form-control" disabled>
                            <option value="">Test seçiniz</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="date" id="edit-deadline" class="form-control date-input">
                    <input type="time" id="edit-deadline-time" class="form-control date-input">
                </div>
                
                <h5 style="margin-top: 15px; margin-bottom: 10px;">Sorular</h5>
                <div id="edit-questions-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;"></div>
                
                <button id="btn-add-new-question" class="btn btn-warning" style="width: 100%; margin-bottom: 10px;">➕ Yeni Soru Ekle</button>
                
                <div style="display: flex; gap: 10px;">
                    <button id="btn-save-edit" class="btn btn-success" style="flex: 1;">💾 Tüm Değişiklikleri Kaydet</button>
                    <button id="btn-cancel-edit" class="btn" style="flex: 1; background: #eee;">İptal</button>
                </div>
            </div>
            
            <div id="student-actions" style="display: none;">
                <button id="btn-start-activity" class="btn btn-success" style="width: 100%;">Hadi Başlayalım!</button>
                <div id="completed-info" style="display: none; margin-top: 15px; padding: 15px; background: #d4edda; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: #155724;">✅ Bu ödevi tamamladınız!</p>
                    <p id="completed-score" style="margin: 5px 0 0 0; font-weight: bold; color: var(--success);"></p>
                    <p id="completed-time" style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;"></p>
                </div>
                <div id="book-task-actions" style="display:none; margin-top: 12px; padding: 12px; background:#f8fafc; border-radius:10px; border:1px solid #e5e7eb;">
                    <div id="book-task-title" style="font-weight:600; margin-bottom:6px;">📗 Kitap/Test Ödevi</div>
                    <div id="book-task-status" style="color:#666; font-size:0.9rem; margin-bottom:8px;">Durum: Başlanmadı</div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="btn-book-started" class="btn btn-primary" style="flex:1;">Yapmaya Başladım</button>
                        <button id="btn-book-finished" class="btn btn-success" style="flex:1;">Bitirdim</button>
                    </div>
                    <small id="book-task-note" style="display:block; margin-top:8px; color:#888;">Not: Bitirdim dediğinizde öğretmen onayı gerekir.</small>
                </div>
            </div>
            
            <button id="close-task-modal" class="btn" style="width: 100%; margin-top: 10px; background: #eee;">Kapat</button>
        </div>
    </div>

    <!-- Ödev Oluştur Modal -->
    <div id="create-task-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">Yeni Ödev Oluştur</h2>
                <button id="btn-close-create" class="btn" style="background: #eee;">Kapat</button>
            </div>
            <div id="teacher-panel" class="card" style="display: none;">
                <h3>🧪 Yeni Karma Ödev Oluştur</h3>
                <input type="text" id="task-title" placeholder="Ödev Başlığı" class="form-control">
                <input type="text" id="task-desc" placeholder="Ödev Açıklaması (Opsiyonel)" class="form-control">
                <select id="task-target" class="form-control">
                    <option value="all">Tüm Sınıflar</option>
                </select>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; color: #666; font-size: 0.9rem;"><small>Son Teslim Tarihi:</small></label>
                        <input type="date" id="task-deadline" class="form-control date-input" style="margin-bottom: 0;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 5px; color: #666; font-size: 0.9rem;"><small>Saat (Opsiyonel):</small></label>
                        <input type="time" id="task-deadline-time" class="form-control date-input" style="margin-bottom: 0;">
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <div style="flex:1;">
                        <label><small>Kitap (Opsiyonel):</small></label>
                        <select id="task-book" class="form-control">
                            <option value="">Kitap seçiniz</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label><small>Test (Opsiyonel):</small></label>
                        <select id="task-book-test" class="form-control" disabled>
                            <option value="">Test seçiniz</option>
                        </select>
                    </div>
                </div>
                
                <div style="background: #f0f4f8; padding: 15px; border-radius: 10px; border: 1px solid #d1d9e6; margin-bottom: 15px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <div style="flex: 2;">
                            <label><small>Soru Tipi (Opsiyonel):</small></label>
                            <select id="task-type" class="form-control">
                                <option value="quiz">📝 Çoktan Seçmeli</option>
                                <option value="truefalse">✅ Doğru/Yanlış</option>
                                <option value="fill">✍️ Boşluk Doldurma</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label><small>Adet:</small></label>
                            <input type="number" id="q-count" value="1" min="1" max="10" class="form-control">
                        </div>
                    </div>

                    <input type="text" id="main-question" placeholder="Soru metni..." class="form-control">
                    <input type="file" id="question-image" class="form-control" accept="image/*">
                    
                    <div id="options-area" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
                        <input type="text" id="opt-1" placeholder="A Şıkkı" style="width: 48%; padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                        <input type="text" id="opt-2" placeholder="B Şıkkı" style="width: 48%; padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                        <input type="text" id="opt-3" placeholder="C Şıkkı" style="width: 48%; padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                        <input type="text" id="opt-4" placeholder="D Şıkkı" style="width: 48%; padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                    </div>
                    
                    <input type="text" id="correct-answer" placeholder="Doğru Cevap" class="form-control">
                    <button id="btn-add-q" class="btn btn-primary" style="width: 100%;">➕ Soruları Listeye Ekle</button>
                </div>

                <div style="margin-bottom: 10px; font-weight: bold; color: var(--primary);">
                    Toplam Soru: <span id="q-counter-display">0</span>
                </div>
                <div id="added-questions-preview" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 8px; margin-bottom: 10px; background: #fff;"></div>
                
                <button id="btn-save-task" class="btn btn-success" style="width: 100%;">ÖDEVİ YAYINLA</button>
            </div>
        </div>
    </div>

    <!-- İçerik Ekle / İçerikler -->
    <div id="content-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large" style="max-width: 1280px; width: 96vw; height: 90vh; margin: 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <h2 style="margin:0;">İçerikler</h2>
                <button id="btn-close-content" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <div class="content-layout" style="margin-top:12px;">
                <div class="content-left">
                    <div style="display:flex; gap:8px; margin-bottom:10px;">
                        <button id="btn-new-content" class="btn btn-primary" style="flex:1;">Yeni İçerik</button>
                    </div>
                    <div id="content-list"></div>
                </div>
                <div class="content-right">
                    <!-- Öğretmen düzenleme alanı -->
                    <div id="content-editor" style="display:none;">
                        <div class="card" style="margin-bottom:10px;">
                            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                <input id="content-title" class="form-control" placeholder="İçerik Başlığı">
                                <input id="content-desc" class="form-control" placeholder="Kısa Açıklama">
                                <input id="content-target-class" class="form-control" placeholder="Hedef Sınıf (örn: 9)">
                                <input id="content-target-section" class="form-control" placeholder="Hedef Şube (örn: A)">
                            </div>
                        </div>
                        <div class="card" style="margin-bottom:10px;">
                            <div style="font-weight:600; margin-bottom:8px;">İçerik Öğeleri</div>
                            <div id="content-items"></div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                                <button id="btn-add-heading" class="btn btn-primary">Başlık</button>
                                <button id="btn-add-paragraph" class="btn btn-primary">Metin</button>
                                <button id="btn-add-image" class="btn btn-primary">Görsel</button>
                                <button id="btn-add-video" class="btn btn-primary">Video</button>
                                <button id="btn-add-quiz" class="btn btn-primary">Çoktan Seçmeli</button>
                                <button id="btn-add-truefalse" class="btn btn-primary">Doğru/Yanlış</button>
                                <button id="btn-add-short" class="btn btn-primary">Kısa Cevap</button>
                                <button id="btn-add-app" class="btn btn-primary">Uygulama</button>
                                <button id="btn-add-line-trace-app" class="btn btn-warning">Çizgi Oyunu</button>
                                <button id="btn-add-sample" class="btn btn-warning">Örnek İçerik</button>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button id="btn-save-content" class="btn btn-success" style="flex:1;">Kaydet</button>
                            <button id="btn-preview-content" class="btn btn-primary" style="flex:1;">Önizleme</button>
                        </div>
                        <div style="display:flex; gap:8px; margin-top:8px;">
                            <button id="btn-assign-content" class="btn btn-warning" style="flex:1;">Ödev Olarak Ver</button>
                        </div>
                        <div style="display:flex; gap:8px; margin-top:8px;">
                            <button id="btn-delete-content" class="btn btn-danger" style="flex:1;">İçeriği Sil</button>
                        </div>
                        <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
                            <input id="content-assign-deadline" type="date" class="form-control date-input" placeholder="Son tarih">
                            <input id="content-assign-deadline-time" type="time" class="form-control date-input" placeholder="Saat">
                        </div>
                    </div>
                    <!-- Öğrenci görüntüleme alanı -->
                    <div id="content-viewer" style="display:none;">
                        <div class="content-viewer-wrap">
                            <div class="content-left-pane">
                                <div id="content-viewer-header" class="card" style="margin-bottom:10px;"></div>
                                <div id="content-viewer-body"></div>
                            </div>
                            <div class="content-right-pane">
                                <div class="app-workspace" id="app-workspace">
                                    <div class="app-topbar">
                                        <div class="app-topbar-left">
                                            <div id="app-title" class="app-title">Uygulama</div>
                                            <div id="app-link" class="app-link">Uygulama linki yok</div>
                                            <div id="app-timer" class="app-timer">⏱️ 0 dk 0 sn</div>
                                        </div>
                                        <div class="app-topbar-actions">
                                            <button id="btn-app-open" class="app-btn primary">Başlat</button>
                                            <button id="btn-app-fullscreen" class="app-btn primary">Tam Ekran</button>
                                            <button id="btn-app-save" class="app-btn warn">Kaydet</button>
                                            <button id="btn-app-stop" class="app-btn danger">Durdur</button>
                                            <button id="btn-app-exit" class="app-btn danger">Çık</button>
                                        </div>
                                    </div>
                                    <div class="app-frame-area">
                                        <iframe id="content-app-iframe" src="about:blank"></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="content-empty" class="empty-state" style="display:none;">
                        İçerik seçiniz.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Etkinlik Görüntüle Modal (Öğrenci) -->
    <div id="activity-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large" style="max-width: 1400px; width: 98vw; height: 96vh; margin: 0 auto; display:flex; flex-direction:column;">
            <div id="activity-fullbar" class="activity-fullbar">
                <div class="left">
                    <span id="activity-full-title">Uygulama</span>
                    <span id="activity-full-timer">⏱️ 0 dk 0 sn</span>
                </div>
                <div class="right">
                    <button id="btn-activity-full-start" class="btn">Başlat</button>
                    <button id="btn-activity-full-save" class="btn">Kaydet</button>
                    <button id="btn-activity-full-exit" class="btn exit">Tam Ekrandan Çık</button>
                </div>
            </div>
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
                <h2 style="margin:0;">Etkinlik</h2>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                    <div class="activity-header-actions" id="activity-header-actions">
                        <button id="btn-activity-head-add-level" class="app-btn primary">Seviye Ekle</button>
                        <button id="btn-activity-head-edit-level" class="app-btn warn">Seviye Düzenle</button>
                        <button id="btn-activity-head-delete-level" class="app-btn danger">Seviye Sil</button>
                        <button id="btn-activity-head-start" class="app-btn primary">Başlat</button>
                        <button id="btn-activity-head-save" class="app-btn warn">Kaydet</button>
                        <button id="btn-activity-head-exit" class="app-btn danger">Çık</button>
                        <span id="block-runner-timer" class="app-timer">⏱️ 0 dk 0 sn</span>
                    </div>
                    <button id="btn-close-activity" class="btn" style="background:#eee;">Kapat</button>
                </div>
            </div>
                <div class="activity-layout">
                    <div class="activity-left">
                    <div id="activity-title" class="activity-title">Uygulama</div>
                    <div id="activity-link" class="activity-link">Link yok</div>
                    <div class="activity-timer" id="activity-timer">⏱️ 0 dk 0 sn</div>
                    <div class="activity-actions">
                        <button id="btn-activity-start" class="app-btn primary">Başlat</button>
                        <button id="btn-activity-fullscreen" class="app-btn primary">Tam Ekran</button>
                        <button id="btn-activity-save" class="app-btn warn">Kaydet</button>
                        <button id="btn-activity-exit" class="app-btn danger">Çık</button>
                    </div>
                    </div>
                    <div class="activity-right">
                        <div id="activity-frame-status" class="activity-frame-status"></div>
                        <div class="activity-pause-overlay">
                            <div class="activity-pause-card">
                                <div id="activity-pause-title" class="pause-title" style="font-weight:700;">Duraklatıldı</div>
                                <button id="btn-activity-resume" class="btn btn-play-resume" title="Devam Et" aria-label="Devam Et">▶</button>
                            </div>
                        </div>
                        <iframe id="activity-iframe" src="about:blank"></iframe>
                    </div>
                </div>
                <div id="external-app-overlay" class="modal-overlay" style="display:none;">
                    <div class="modal-content" style="max-width:420px; text-align:center;">
                        <h3 style="margin-top:0;">Uygulama Yeni Sekmede Açıldı</h3>
                        <p style="color:#666;">Paneline döndüğünde ilerlemeni kaydedebilirsin.</p>
                        <button id="btn-external-open" class="btn btn-primary" style="width:100%;">Uygulamayı Yeni Sekmede Aç</button>
                        <button id="btn-external-save" class="btn btn-success" style="width:100%; margin-top:8px;">Kaydet ve Bitir</button>
                        <button id="btn-external-close" class="btn" style="width:100%; margin-top:10px; background:#eee;">Kapat</button>
                    </div>
                </div>
        </div>
    </div>

    <!-- Etkinlik Düzenle Modal -->
    <div id="assignment-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <h2 style="margin:0;">Etkinlik Düzenle</h2>
                <button id="btn-close-assignment" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <input id="assignment-title" class="form-control" placeholder="Etkinlik Başlığı">
            <input id="assignment-desc" class="form-control" placeholder="Açıklama">
            <input id="assignment-class" class="form-control" placeholder="Hedef Sınıf (örn: 9)">
            <input id="assignment-section" class="form-control" placeholder="Hedef Şube (örn: A)">
            <div style="display:flex; gap:8px;">
                <input id="assignment-deadline" type="date" class="form-control date-input">
                <input id="assignment-deadline-time" type="time" class="form-control date-input">
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <button id="btn-save-assignment" class="btn btn-success" style="flex:1;">Kaydet</button>
                <button id="btn-delete-assignment" class="btn btn-danger" style="flex:1;">Sil</button>
            </div>
            <div id="assignment-students-section" style="margin-top:12px; padding:10px; background:#f8fafc; border-radius:10px; border:1px solid #e5e7eb; display:none;">
                <div style="font-weight:600; margin-bottom:6px;">👥 Öğrenci Durumu</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                    <select id="assignment-filter-class" class="form-control" style="max-width:160px;">
                        <option value="">Sınıf</option>
                    </select>
                    <select id="assignment-filter-section" class="form-control" style="max-width:160px;">
                        <option value="">Şube</option>
                    </select>
                </div>
                <div id="assignment-students-list" style="max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>
    </div>

    <!-- Silme Onay Modal -->
    <div id="confirm-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content confirm-shell">
            <div class="confirm-head">
                <div class="confirm-icon">!</div>
                <h3 class="confirm-title">Onay Gerekli</h3>
            </div>
            <div id="confirm-message" class="confirm-message">Silmek istiyor musunuz?</div>
            <div class="confirm-actions">
                <button id="btn-confirm-yes" class="btn btn-danger" style="flex:1;">Evet, Sil</button>
                <button id="btn-confirm-no" class="btn" style="flex:1; background:#eee;">Vazgeç</button>
            </div>
        </div>
    </div>

      <!-- Bilgi Modal -->
      <div id="info-modal" class="modal-overlay" style="display: none;">
          <div id="info-modal-shell" class="modal-content info-shell" style="max-width:460px;">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                  <div id="info-icon" style="width:36px; height:36px; border-radius:12px; background:#e0f2fe; color:#0284c7; display:flex; align-items:center; justify-content:center; font-weight:700;">i</div>
                  <h3 id="info-title" style="margin:0;">Bilgi</h3>
              </div>
              <div id="info-message" style="margin-bottom:16px; color:#374151;">Bilgi mesajı</div>
              <div style="display:flex; gap:8px;">
                  <button id="btn-info-ok" class="btn btn-primary" style="flex:1;">Tamam</button>
                  <button id="btn-info-continue" class="btn btn-continue-play" style="flex:1; display:none;" title="Devam Et" aria-label="Devam Et"><span class="play-ico">▶</span></button>
              </div>
          </div>
      </div>

    <!-- Öğrenci Detay Modal -->
    <div id="student-detail-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <h2 id="student-detail-name">Öğrenci Detayı</h2>
            
            <div class="stat-detail-grid">
                <div class="stat-detail-item">
                    <div class="stat-detail-value" id="detail-total-tasks">0</div>
                    <div class="stat-detail-label">Toplam Ödev</div>
                </div>
                <div class="stat-detail-item">
                    <div class="stat-detail-value" id="detail-completed">0</div>
                    <div class="stat-detail-label">Tamamlanan</div>
                </div>
                <div class="stat-detail-item">
                    <div class="stat-detail-value" id="detail-success-rate">0%</div>
                    <div class="stat-detail-label">Başarı Oranı</div>
                </div>
                <div class="stat-detail-item">
                    <div class="stat-detail-value" id="detail-avg-time">0 dk</div>
                    <div class="stat-detail-label">Sistemde Geçen Süre</div>
                </div>
                <div class="stat-detail-item">
                    <div class="stat-detail-value" id="detail-total-xp">0</div>
                    <div class="stat-detail-label">Toplam XP</div>
                </div>
                <div class="stat-detail-item">
                    <div class="stat-detail-value" id="detail-rank">-</div>
                    <div class="stat-detail-label">Sıralama</div>
                </div>
            </div>
            
            <div class="chart-container">
                <canvas id="studentChart"></canvas>
            </div>
            
            <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px;">
                <div style="flex: 1; min-width: 260px;">
                    <h4 style="margin: 0 0 8px 0;">Ödev Geçmişi</h4>
                    <div id="student-activity-history" style="max-height: 300px; overflow-y: auto;"></div>
                </div>
                <div style="flex: 1; min-width: 260px;">
                    <h4 style="margin: 0 0 8px 0;">Etkinlik Geçmişi</h4>
                    <div id="student-content-history" style="max-height: 300px; overflow-y: auto;"></div>
                </div>
                <div style="flex: 1; min-width: 260px;">
                    <h4 style="margin: 0 0 8px 0;">Quiz Geçmişi</h4>
                    <div class="chart-container" style="height:180px; margin-bottom:8px;">
                        <canvas id="studentQuizChart"></canvas>
                    </div>
                    <div id="student-quiz-history" style="max-height: 300px; overflow-y: auto;"></div>
                </div>
                <div style="flex: 1 1 100%; margin-top: 12px;">
                    <h4 style="margin: 0 0 8px 0;">Blok Kodlama</h4>
                    <div id="student-blockrun-report" style="background:#fff; border:1px solid #e5e7eb; padding:12px; border-radius:10px; max-height:220px; overflow:auto;">
                        <div id="blockrun-summary">Veri yükleniyor...</div>
                    </div>
                </div>
            </div>
            
            <button id="btn-download-student-pdf" class="btn btn-primary" style="width: 100%; margin-top: 15px;">PDF İndir</button>
            <button onclick="closeStudentDetail()" class="btn" style="width: 100%; margin-top: 20px; background: #eee;">Kapat</button>
        </div>
    </div>

    <!-- Öğrencilerim Modal -->
    <div id="students-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">Öğrencilerim</h2>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="btn-delete-all-students" class="btn btn-danger">Tüm Öğrencileri Sil</button>
                    <button id="btn-reset-all-students-passwords" class="btn btn-warning">Tüm Şifreleri 123456 Yap</button>
                    <button id="btn-close-students" class="btn" style="background: #eee;">Kapat</button>
                </div>
            </div>
            <div class="filter-bar" style="margin-bottom: 10px;">
                <select id="students-filter-scope" class="form-control" style="max-width: 200px;">
                    <option value="all">Tüm Öğrenciler</option>
                    <option value="class">Sınıfa Göre</option>
                </select>
                <select id="students-filter-class" class="form-control" style="max-width: 120px;">
                    <option value="">Sınıf</option>
                </select>
                <select id="students-filter-section" class="form-control" style="max-width: 120px;">
                    <option value="">Şube</option>
                </select>
            </div>
            <div id="students-list" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
    </div>
    <div id="login-cards-modal" class="modal-overlay" style="display:none; z-index:23010;">
        <div class="modal-content login-cards-modal-content">
            <div class="login-cards-toolbar">
                <div>
                    <h3 style="margin:0;">🪪 Giriş Kartları</h3>
                    <small id="login-cards-summary" style="color:#64748b;">Öğrenciler yükleniyor...</small>
                </div>
                <div style="display:flex; gap:8px;">
                    <button id="btn-print-login-cards" class="btn btn-primary">Yazdır</button>
                    <button id="btn-close-login-cards" class="btn" style="background:#eee;">Kapat</button>
                </div>
            </div>
            <div id="login-cards-grid" class="login-cards-grid"></div>
        </div>
    </div>

    <!-- Blok Kodlama Ödevi Ver Modal -->
    <div id="block-homework-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content homework-assign-shell">
            <div class="homework-assign-head">
                <h3 id="block-homework-modal-title" style="margin:0;">Blok Kodlama Ödevi Ver</h3>
                <button id="btn-close-block-homework-modal" class="btn homework-assign-close">Kapat</button>
            </div>
            <input id="block-hw-assignment-type" type="hidden" value="block2d">
            <div class="form-group">
                <label>Ödev Başlığı</label>
                <input id="block-hw-title" class="form-control" type="text" placeholder="Örn: Blok Kodlama Ödevi - 1">
            </div>
            <div class="form-group">
                <label>Sınıf (boş = tümü)</label>
                <input id="block-hw-class" class="form-control" type="text" placeholder="Örn: 5A">
            </div>
            <div class="form-group">
                <label>Şube (opsiyonel)</label>
                <input id="block-hw-section" class="form-control" type="text" placeholder="Örn: A">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div class="form-group">
                    <label>Son Tarih</label>
                    <input id="block-hw-deadline" class="form-control" type="date">
                </div>
                <div class="form-group">
                    <label>Saat</label>
                    <input id="block-hw-deadline-time" class="form-control" type="time" value="23:59">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div class="form-group">
                    <label>Başlangıç Seviye</label>
                    <input id="block-hw-level-start" class="form-control" type="number" min="1" value="1">
                </div>
                <div class="form-group">
                    <label>Bitiş Seviye</label>
                    <input id="block-hw-level-end" class="form-control" type="number" min="1" value="1">
                </div>
            </div>
            <small class="homework-assign-hint">Sadece seçtiğiniz seviye aralığı öğrenciye açık olur.</small>
            <div class="homework-assign-actions">
                <button id="btn-save-block-homework" class="btn homework-assign-save">Kaydet</button>
                <button id="btn-delete-block-homework" class="btn homework-assign-delete" style="display:none;">Sil</button>
            </div>
        </div>
    </div>

    <!-- Compute It Ödevi Ver Modal -->
    <div id="compute-homework-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content homework-assign-shell">
            <div class="homework-assign-head">
                <h3 style="margin:0;">Compute It Ödevi Ver</h3>
                <button id="btn-close-compute-homework-modal" class="btn homework-assign-close">Kapat</button>
            </div>
            <div class="form-group">
                <label>Ödev Başlığı</label>
                <input id="compute-hw-title" class="form-control" type="text" placeholder="Örn: Compute It Ödevi - 1">
            </div>
            <div class="form-group">
                <label>Sınıf (boş = tümü)</label>
                <input id="compute-hw-class" class="form-control" type="text" placeholder="Örn: 5A">
            </div>
            <div class="form-group">
                <label>Şube (opsiyonel)</label>
                <input id="compute-hw-section" class="form-control" type="text" placeholder="Örn: A">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div class="form-group">
                    <label>Son Tarih</label>
                    <input id="compute-hw-deadline" class="form-control" type="date">
                </div>
                <div class="form-group">
                    <label>Saat</label>
                    <input id="compute-hw-deadline-time" class="form-control" type="time" value="23:59">
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div class="form-group">
                    <label>Başlangıç Seviye</label>
                    <input id="compute-hw-level-start" class="form-control" type="number" min="1" value="1">
                </div>
                <div class="form-group">
                    <label>Bitiş Seviye</label>
                    <input id="compute-hw-level-end" class="form-control" type="number" min="1" value="1">
                </div>
            </div>
            <small class="homework-assign-hint">Sadece seçtiğiniz seviye aralığı öğrenciye açık olur.</small>
            <div class="homework-assign-actions">
                <button id="btn-save-compute-homework" class="btn homework-assign-save">Kaydet</button>
                <button id="btn-delete-compute-homework" class="btn homework-assign-delete" style="display:none;">Sil</button>
            </div>
        </div>
    </div>

    <!-- Öğrenci Ekle Modal -->
    <div id="add-student-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">Öğrenci Ekle</h2>
                <button id="btn-close-add-student" class="btn" style="background: #eee;">Kapat</button>
            </div>

            <h4 style="margin: 10px 0;">Tekli Kayıt</h4>
            <div style="display:flex; gap:10px;">
                <input type="text" id="add-student-firstname" class="form-control" placeholder="Ad">
                <input type="text" id="add-student-lastname" class="form-control" placeholder="Soyad">
            </div>
            <input type="text" id="add-student-username" class="form-control" placeholder="Kullanıcı Adı (e-posta olabilir)">
            <input type="password" id="add-student-password" class="form-control" placeholder="Şifre (en az 6 karakter)">
            <div style="display:flex; gap:10px;">
                <input type="text" id="add-student-class" class="form-control" placeholder="Sınıf (örn: 9)">
                <input type="text" id="add-student-section" class="form-control" placeholder="Şube (örn: A)">
            </div>
            <button id="btn-add-student-save" class="btn btn-success" style="width: 100%; margin-top: 8px;">Kaydet</button>

            <hr style="margin: 18px 0;">

            <h4 style="margin: 10px 0;">Toplu Kayıt (CSV)</h4>
            <small style="color:#666; display:block; margin-bottom:6px;">
                Satır formatı: Ad, Soyad, Kullanıcı Adı, Şifre, Sınıf, Şube
            </small>
            <div style="display:flex; gap:10px; flex-wrap: wrap; margin-bottom:8px;">
                <button id="btn-download-student-template" class="btn btn-primary" style="flex:1;">⬇️ Örnek Excel (CSV) İndir</button>
                <input type="file" id="bulk-students-file" class="form-control" accept=".csv,.xlsx,.xls" style="flex:1;">
            </div>
            <textarea id="bulk-students-input" class="form-control" rows="6" placeholder="Örn:
Ali, Veli, ali, 123456, 9, A
Ayşe, Yılmaz, ayse, 123456, 9, B"></textarea>
            <input type="password" id="bulk-default-password" class="form-control" placeholder="Varsayılan Şifre (boş olanlar için)">
            <button id="btn-bulk-student-save" class="btn btn-primary" style="width: 100%; margin-top: 8px;">Toplu Kayıt</button>
        </div>
    </div>

    <!-- Kitap Ekle Modal -->
    <div id="books-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
                <h2 style="margin:0;">Kitap Ekle</h2>
                <button id="btn-close-books" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <h4 style="margin: 10px 0;">Tekli Kayıt</h4>
            <input type="text" id="book-name" class="form-control" placeholder="Kitap Adı">
            <input type="text" id="book-tests" class="form-control" placeholder="Testler (virgülle ayırın)">
            <button id="btn-save-book" class="btn btn-success" style="width:100%; margin-top:8px;">Kaydet</button>

            <hr style="margin: 18px 0;">

            <h4 style="margin: 10px 0;">Toplu Kayıt (CSV / Excel)</h4>
            <small style="color:#666; display:block; margin-bottom:6px;">
                Satır formatı: Kitap Adı, Testler (Test1|Test2|Test3)
            </small>
            <div style="display:flex; gap:10px; flex-wrap: wrap; margin-bottom:8px;">
                <button id="btn-download-book-template" class="btn btn-primary" style="flex:1;">⬇️ Örnek Şablon İndir</button>
                <input type="file" id="bulk-books-file" class="form-control" accept=".csv,.xlsx,.xls" style="flex:1;">
            </div>
            <hr style="margin: 18px 0;">
            <h4 style="margin: 10px 0;">Kayıtlı Kitaplar</h4>
            <div style="display:flex; gap:10px; flex-wrap: wrap;">
                <select id="books-list" class="form-control" style="flex:1;">
                    <option value="">Kitap seçiniz</option>
                </select>
                <button id="btn-clear-book" class="btn btn-danger">Temizle</button>
            </div>
            <select id="books-tests" class="form-control" style="margin-top:8px;" disabled>
                <option value="">Testler</option>
            </select>
        </div>
    </div>

    <!-- Ödev Onayları Modal -->
    <div id="approvals-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
                <h2 style="margin:0;">Ödev Onayları</h2>
                <button id="btn-close-approvals" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                <select id="approvals-task-select" class="form-control" style="flex:1;">
                    <option value="">Kitap/Test ödevi seçiniz</option>
                </select>
                <select id="approvals-class" class="form-control" style="max-width:160px;">
                    <option value="">Sınıf</option>
                </select>
                <select id="approvals-section" class="form-control" style="max-width:160px;">
                    <option value="">Şube</option>
                </select>
            </div>
            <div id="approvals-list" style="max-height:320px; overflow-y:auto;"></div>
            <button id="btn-approvals-approve" class="btn btn-success" style="width:100%; margin-top:8px;">Seçilenleri Onayla</button>
        </div>
    </div>

    <!-- Raporlar Modal -->
    <div id="reports-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">Raporlar</h2>
                <button id="btn-close-reports" class="btn" style="background: #eee;">Kapat</button>
            </div>
            <div id="reports-list" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
    </div>

    <!-- Ödevler Modal -->
    <div id="tasks-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">Ödevler</h2>
                <button id="btn-close-tasks" class="btn" style="background: #eee;">Kapat</button>
            </div>
            <div class="filter-bar" style="margin-bottom: 10px;">
                <input id="tasks-filter-name" class="form-control" style="max-width: 240px;" placeholder="Ödev ismi">
                <input id="tasks-filter-from" class="form-control date-input" type="date" style="max-width: 160px;">
                <input id="tasks-filter-to" class="form-control date-input" type="date" style="max-width: 160px;">
            </div>
            <div style="display:flex; gap:14px; align-items:center; margin:0 0 10px 2px; flex-wrap:wrap;">
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                    <input id="tasks-filter-active" type="checkbox" checked>
                    <span>Aktif Ödevler</span>
                </label>
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                    <input id="tasks-filter-archived" type="checkbox" checked>
                    <span>Arşivlenen Ödevler</span>
                </label>
            </div>
            <div id="tasks-list" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
    </div>

    <!-- Sınıflarım Modal -->
    <div id="classes-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">Sınıflarım</h2>
                <button id="btn-close-classes" class="btn" style="background: #eee;">Kapat</button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr auto auto auto; gap:8px; margin-bottom:10px;">
                <input id="class-manager-class" class="form-control" placeholder="Sınıf">
                <input id="class-manager-section" class="form-control" placeholder="Şube">
                <button id="btn-class-add" class="btn btn-success">Ekle</button>
                <button id="btn-class-update" class="btn btn-primary">Güncelle</button>
                <button id="btn-class-delete" class="btn btn-danger">Sil</button>
            </div>
            <textarea id="class-manager-bulk" class="form-control" rows="4" placeholder="Toplu sınıf ekleme: her satıra Sınıf,Şube veya Sınıf/Şube yazın"></textarea>
            <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                <button id="btn-class-bulk-add" class="btn btn-primary">Toplu Ekle</button>
            </div>
            <div id="classes-list" style="max-height: 420px; overflow-y: auto;"></div>
        </div>
    </div>

    <!-- Tüm Ödevler Modal -->
    <div id="all-tasks-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 id="all-items-title" style="margin: 0;">Tüm İçerikler</h2>
                <button id="btn-close-all-tasks" class="btn" style="background: #eee;">Kapat</button>
            </div>
            <div id="all-tasks-list" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
    </div>

    <!-- Ödev Öğrenci Durum Modal -->
    <div id="task-students-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 id="task-students-title" style="margin: 0;">Ödev Durumu</h2>
                <button id="btn-close-task-students" class="btn" style="background: #eee;">Kapat</button>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                <select id="task-students-filter-class" class="form-control" style="max-width:160px;">
                    <option value="">Sınıf</option>
                </select>
                <select id="task-students-filter-section" class="form-control" style="max-width:160px;">
                    <option value="">Şube</option>
                </select>
            </div>
            <div id="task-students-list" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
    </div>

    <!-- Şifre Değiştir Modal -->
    <div id="password-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <h2 style="margin-top: 0;">Şifre Değiştir</h2>
            <input type="password" id="password-new" class="form-control" placeholder="Yeni Şifre (en az 6 karakter)">
            <button id="btn-password-save" class="btn btn-success" style="width: 100%;">Kaydet</button>
            <button id="btn-password-cancel" class="btn" style="width: 100%; margin-top: 10px; background: #eee;">İptal</button>
        </div>
    </div>

    <!-- Profil Modal -->
    <div id="profile-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large" style="max-width: 760px;">
            <h2 style="margin-top: 0;">Profil Bilgileri</h2>
            <div style="display:flex; gap:10px;">
                <input type="text" id="profile-firstname" class="form-control" placeholder="Ad">
                <input type="text" id="profile-lastname" class="form-control" placeholder="Soyad">
            </div>
            <input type="text" id="profile-username" class="form-control" placeholder="Kullanıcı Adı">
            <input type="password" id="profile-password" class="form-control" placeholder="Yeni Şifre (en az 6 karakter)">
            <button id="btn-profile-save" class="btn btn-success" style="width: 100%;">Güncelle</button>
            <button id="btn-profile-delete" class="btn btn-danger" style="width: 100%; margin-top: 10px;">Hesabımı Sil</button>
            <hr style="margin: 16px 0;">
            <h3 style="margin: 0 0 10px 0;">Öğretmen Ekle</h3>
            <h4 style="margin: 6px 0;">Tekli Kayıt</h4>
            <div style="display:flex; gap:10px;">
                <input type="text" id="add-teacher-firstname" class="form-control" placeholder="Ad">
                <input type="text" id="add-teacher-lastname" class="form-control" placeholder="Soyad">
            </div>
            <input type="text" id="add-teacher-username" class="form-control" placeholder="Kullanıcı Adı (e-posta olabilir)">
            <input type="password" id="add-teacher-password" class="form-control" placeholder="Şifre (en az 6 karakter)">
            <button id="btn-add-teacher-save" class="btn btn-primary" style="width: 100%; margin-top: 8px;">Öğretmen Kaydet</button>
            <hr style="margin: 16px 0;">
            <h4 style="margin: 6px 0;">Toplu Kayıt (CSV / XLSX)</h4>
            <small style="color:#666; display:block; margin-bottom:6px;">
                Satır formatı: Ad, Soyad, Kullanıcı Adı, Şifre
            </small>
            <div style="display:flex; gap:10px; flex-wrap: wrap; margin-bottom:8px;">
                <button id="btn-download-teacher-template" class="btn btn-primary" style="flex:1;">⬇️ Örnek CSV İndir</button>
                <input type="file" id="bulk-teachers-file" class="form-control" accept=".csv,.xlsx,.xls" style="flex:1;">
            </div>
            <textarea id="bulk-teachers-input" class="form-control" rows="5" placeholder="Örn:
Ali, Veli, ogretmen.ali, 123456
Ayşe, Yılmaz, ogretmen.ayse, 123456"></textarea>
            <input type="password" id="bulk-teachers-default-password" class="form-control" placeholder="Varsayılan Şifre (boş olanlar için)">
            <button id="btn-bulk-teacher-save" class="btn btn-success" style="width: 100%; margin-top: 8px;">Toplu Öğretmen Kaydet</button>
            <button id="btn-profile-cancel" class="btn" style="width: 100%; margin-top: 10px; background: #eee;">Kapat</button>
        </div>
    </div>

    <!-- Öğrenci İstatistik Modal -->
    <div id="my-stats-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content modal-large">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0;">İstatistiklerim</h2>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="btn-my-stats-report" class="btn btn-primary">Raporu Aç</button>
                    <button id="btn-close-my-stats" class="btn" style="background: #eee; border-radius:50%; width:34px; height:34px; padding:0; font-size:18px; line-height:1;">×</button>
                </div>
            </div>
            <div id="my-stats-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number" id="my-total-tasks">0</div>
                        <div class="stat-label">Toplam Ödev</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-total-activities">0</div>
                        <div class="stat-label">Toplam Etkinlik</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-completed-tasks">0</div>
                        <div class="stat-label">Yapılan Ödev</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-completed-activities">0</div>
                        <div class="stat-label">Yapılan Etkinlik</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-task-rate">0%</div>
                        <div class="stat-label">Ödev Tamamlama</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-activity-rate">0%</div>
                        <div class="stat-label">Etkinlik Tamamlama</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-block-rate">0%</div>
                        <div class="stat-label">Blok Kodlama Tamamlama</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-compute-rate">0%</div>
                        <div class="stat-label">Compute It Tamamlama</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-code-rate">0%</div>
                        <div class="stat-label">Kodlama Toplam Yüzde</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="my-total-xp">0</div>
                        <div class="stat-label">Toplam XP</div>
                    </div>
                </div>
                <div class="chart-container" style="display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:10px; align-items: center; justify-items: center;">
                    <div style="min-width:0; width:100%; max-width:320px;">
                        <div style="font-weight:600; margin-bottom:6px;">Ödev İstatistik</div>
                        <canvas id="myTaskChart" height="140" style="max-width:100%;"></canvas>
                    </div>
                    <div style="min-width:0; width:100%; max-width:320px;">
                        <div style="font-weight:600; margin-bottom:6px;">Etkinlik İstatistik</div>
                        <canvas id="myActivityChart" height="140" style="max-width:100%;"></canvas>
                    </div>
                    <div style="min-width:0; width:100%; max-width:320px;">
                        <div style="font-weight:600; margin-bottom:6px;">Blok Kodlama</div>
                        <canvas id="myBlockChart" height="140" style="max-width:100%;"></canvas>
                    </div>
                    <div style="min-width:0; width:100%; max-width:320px;">
                        <div style="font-weight:600; margin-bottom:6px;">Compute It</div>
                        <canvas id="myComputeChart" height="140" style="max-width:100%;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Ders Oluştur Modal (Öğretmen) -->
    <div id="lesson-builder-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content modal-large lesson-builder-shell">
            <div class="lesson-builder-topbar">
                <div class="lesson-builder-brand">
                    <span class="dot"></span>
                    <span>Ders Oluşturucu</span>
                </div>
                <div class="lesson-title-wrap">
                    <input id="lesson-title" class="form-control lesson-main-input" placeholder="Ders başlığı">
                </div>
                <div class="lesson-builder-actions">
                    <button id="btn-save-slide" class="btn btn-primary">Slide Kaydet</button>
                    <button id="btn-save-lesson" class="btn btn-success">Dersi Kaydet</button>
                    <button id="btn-delete-slide" class="btn btn-danger">Slide Sil</button>
                    <button id="btn-delete-lesson" class="btn" style="background:#ef4444;color:#fff;">Dersi Sil</button>
                    <button id="btn-close-lesson-builder" class="btn" style="background:#e2e8f0;">Kapat</button>
                </div>
            </div>
            <div class="lesson-builder-main">
                <aside class="lesson-panel left">
                    <div class="lesson-left-top">
                        <span class="title">Ders Sayfaları</span>
                        <button id="btn-add-lesson-slide" class="btn btn-primary">+ Sayfa Ekle</button>
                    </div>
                    <div id="lesson-slide-list"></div>
                </aside>

                <section class="lesson-panel center">
                    <div class="lesson-quick-tools">
                        <button id="btn-lesson-quick-text" type="button" class="btn btn-primary">📝 Yazı Ekle</button>
                        <button id="btn-lesson-quick-image" type="button" class="btn">🖼️ Görsel Ekle</button>
                        <button id="btn-lesson-quick-question" type="button" class="btn btn-warning">❓ Soru Ekle</button>
                    </div>
                    <div class="lesson-toolbar">
                        <button type="button" class="btn" data-lesson-cmd="bold" title="Kalın">T</button>
                        <button type="button" class="btn" data-lesson-cmd="createLink" title="Link">🔗</button>
                        <button type="button" id="btn-lesson-insert-image" class="btn" title="Görsel">🖼️</button>
                        <button type="button" class="btn" data-lesson-cmd="insertUnorderedList" title="Liste">•</button>
                        <button type="button" class="btn" data-lesson-cmd="justifyLeft" title="Sola">⬅</button>
                        <button type="button" class="btn" data-lesson-cmd="justifyCenter" title="Ortala">↔</button>
                        <button type="button" class="btn" data-lesson-cmd="justifyRight" title="Sağa">➡</button>
                        <button type="button" id="btn-add-canvas-text" class="btn" title="Metin kutusu">T+</button>
                        <button type="button" id="btn-add-canvas-image" class="btn" title="Görsel kutusu">🖼️+</button>
                        <button type="button" id="btn-delete-selected-canvas-text" class="btn" title="Seçili metni sil">🗑️T</button>
                        <button type="button" id="btn-delete-all-canvas-text" class="btn" title="Tüm metinleri sil">🗑️TT</button>
                    </div>
                    <div class="lesson-editor-scroll">
                        <div class="lesson-editor-head">
                            <span>İçerik Alanı</span>
                            <small>Yazı, görsel ve soruyu buradan düzenleyin</small>
                        </div>
                        <textarea id="lesson-desc" class="form-control" rows="2" placeholder="Ders açıklaması"></textarea>
                        <div id="slide-content-area" class="lesson-content-block">
                            <div id="slide-content-editor" contenteditable="true"></div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                                <input id="slide-image-url" class="form-control" placeholder="Slide görsel URL">
                                <input id="slide-image-file" type="file" class="form-control" accept="image/*">
                            </div>
                            <div id="slide-canvas-editor" style="margin-top:10px;display:none;">
                                <div style="font-size:12px;color:#64748b;margin-bottom:4px;">Sürükle-bırak yerleşim alanı</div>
                                <div id="lesson-canvas-stage" style="position:relative;height:300px;border:1px dashed #94a3b8;border-radius:10px;background:#fff;overflow:hidden;"></div>
                            </div>
                        </div>
                        <div id="slide-question-area" class="lesson-content-block" style="display:none;">
                            <div class="lesson-editor-head" style="margin-bottom:8px;">
                                <span>Soru Alanı</span>
                            </div>
                            <div class="lesson-question-grid">
                                <input id="slide-question" class="form-control" placeholder="Soru metni">
                                <input id="slide-opt-1" class="form-control" placeholder="Seçenek 1">
                                <input id="slide-opt-2" class="form-control" placeholder="Seçenek 2">
                                <input id="slide-opt-3" class="form-control" placeholder="Seçenek 3">
                                <input id="slide-opt-4" class="form-control" placeholder="Seçenek 4">
                                <input id="slide-correct" class="form-control full" placeholder="Doğru seçenek (ör: A)">
                                <input id="slide-fill-answers" class="form-control full" placeholder="Boşluk cevapları (virgülle)">
                            </div>
                        </div>
                        <div class="lesson-editor-head" style="margin-top:10px;">
                            <span>Canlı Önizleme</span>
                        </div>
                        <div id="lesson-slide-preview"></div>
                    </div>
                </section>

                <aside class="lesson-panel right">
                    <div class="lesson-side-title">Sayfa Ayarları</div>
                    <div class="lesson-side-block">
                        <input id="slide-title" class="form-control" placeholder="Slide başlığı">
                        <select id="slide-type" class="form-control">
                            <option value="content">Konu Anlatım</option>
                            <option value="question">Soru</option>
                            <option value="mixed">Konu + Soru</option>
                        </select>
                        <select id="slide-layout" class="form-control">
                            <option value="text">Düz Metin</option>
                            <option value="split">Sol Metin / Sağ Görsel</option>
                            <option value="cover">Tam Görsel Üstü Metin</option>
                            <option value="canvas">Serbest Yerleşim</option>
                        </select>
                        <select id="slide-question-type" class="form-control">
                            <option value="multiple">Çoktan Seçmeli</option>
                            <option value="boolean">Doğru / Yanlış</option>
                            <option value="short">Kısa Cevap</option>
                            <option value="fill">Boşluk Doldurma</option>
                        </select>
                    </div>
                    <div class="lesson-side-title">Kullanım</div>
                    <div class="lesson-side-block" style="font-size:12px;color:#64748b;line-height:1.5;">
                        1) Soldan sayfa ekleyin.
                        2) Ortada yazı, görsel ve soru içeriğini hazırlayın.
                        3) Sağdan sayfa tipini seçin ve kaydedin.
                    </div>
                </aside>
            </div>
        </div>
    </div>

    <div id="lesson-text-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="max-width:520px;">
            <h3 id="lesson-text-modal-title" style="margin-top:0;">Metin</h3>
            <textarea id="lesson-text-modal-input" class="form-control" rows="6" placeholder="Metin girin"></textarea>
            <div style="display:flex;gap:8px;margin-top:10px;">
                <button id="btn-lesson-text-ok" class="btn btn-primary" style="flex:1;">Kaydet</button>
                <button id="btn-lesson-text-cancel" class="btn" style="flex:1;background:#eee;">Vazgeç</button>
            </div>
        </div>
    </div>

    <!-- Ders Oynatıcı Modal (Öğrenci) -->
    <div id="lesson-player-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content modal-large" style="max-width:1100px; height:88vh; display:flex; flex-direction:column;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h2 id="lesson-player-title" style="margin:0;">Ders</h2>
                <button id="btn-close-lesson-player" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <div style="display:grid;grid-template-columns:220px 1fr;gap:10px;flex:1;min-height:0;">
                <div id="lesson-player-nav" style="border:1px solid #e5e7eb;border-radius:10px;padding:8px;overflow:auto;"></div>
                <div id="lesson-player-stage" style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;overflow:auto;background:#f8fafc;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                <div id="lesson-player-progress" style="font-weight:600;color:#475569;">%0 tamamlandı • 0 XP</div>
                <div id="lesson-player-counter" style="color:#64748b;font-weight:600;">1 / 1</div>
                <div style="display:flex;gap:8px;">
                    <button id="btn-lesson-prev" class="btn">Önceki</button>
                    <button id="btn-lesson-next" class="btn btn-primary">Sonraki</button>
                </div>
            </div>
            <div id="lesson-player-track" style="margin-top:8px;display:flex;gap:6px;align-items:center;overflow:auto;"></div>
        </div>
    </div>

    <!-- Canlı Quiz (Öğretmen) -->
    <div id="live-quiz-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content modal-large">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h2 id="live-quiz-modal-title" style="margin:0;">Canlı Quiz</h2>
                <button id="btn-close-live-quiz" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <div class="tabs" style="margin-bottom:8px;">
                <button id="tab-live-quiz-create" class="tab-btn active">Quiz Oluştur</button>
                <button id="tab-live-quiz-start" class="tab-btn">Quiz Başlat</button>
                <button id="tab-live-quiz-results" class="tab-btn">Quiz Sonuçları</button>
            </div>

            <div id="live-quiz-create-pane" class="live-quiz-builder" style="display:grid;">
                <div class="live-quiz-sidebar">
                    <div class="live-quiz-sidebar-head">
                        <span class="title">Soru Listesi</span>
                        <button id="btn-add-live-quiz-question" class="btn btn-primary">+ Soru Ekle</button>
                    </div>
                    <div id="live-quiz-question-list"></div>
                </div>
                <div class="live-quiz-canvas">
                    <div class="live-quiz-global">
                        <input id="live-quiz-title" class="form-control" placeholder="Quiz başlığı">
                        <input id="live-quiz-class" class="form-control" placeholder="Sınıf (boş=tümü)">
                        <input id="live-quiz-section" class="form-control" placeholder="Şube (opsiyonel)">
                    </div>
                    <div id="live-quiz-editor" class="live-quiz-editor-card">
                        <input id="live-q-text" class="form-control live-quiz-main-question" placeholder="Sorunu girmeye başla">
                        <div class="live-quiz-media-drop">
                            <label for="live-q-image" class="live-quiz-media-label">+ Medya Ekle</label>
                            <input id="live-q-image" type="file" accept="image/*">
                            <div id="live-q-image-preview" class="live-quiz-media-preview">Soruya görsel ekleyebilirsin.</div>
                        </div>
                        <div class="live-quiz-options-grid">
                            <input id="live-q-a" class="form-control live-quiz-option-input" placeholder="A seçeneği">
                            <input id="live-q-b" class="form-control live-quiz-option-input" placeholder="B seçeneği">
                            <input id="live-q-c" class="form-control live-quiz-option-input" placeholder="C seçeneği">
                            <input id="live-q-d" class="form-control live-quiz-option-input" placeholder="D seçeneği">
                        </div>
                        <textarea id="live-q-match-pairs" class="form-control" rows="4" style="display:none;margin-top:8px;" placeholder="Her satır: Sol İfade = Sağ İfade&#10;Ör: CPU = İşlemci"></textarea>
                    </div>
                    <div id="live-quiz-preview" class="live-quiz-preview">
                        <div id="live-quiz-preview-q" class="live-quiz-preview-q">Soru önizlemesi burada görünecek.</div>
                        <div id="live-quiz-preview-grid" class="live-quiz-preview-grid"></div>
                    </div>
                </div>
                <aside class="live-quiz-right-panel">
                    <div class="live-quiz-right-title">Question properties</div>
                    <div class="live-quiz-right-block">
                        <div class="label">Soru türü</div>
                        <select id="live-q-type" class="form-control">
                            <option value="multiple">Quiz</option>
                            <option value="truefalse">Doğru / Yanlış</option>
                            <option value="matching">Sürükle Bırak Eşleştirme</option>
                        </select>
                    </div>
                    <div class="live-quiz-right-block">
                        <div class="label">Zaman sınırı</div>
                        <input id="live-q-duration" class="form-control" type="number" min="5" value="30" placeholder="Bu soru için süre/sn">
                    </div>
                    <div class="live-quiz-right-block">
                        <div class="label">Puanlar</div>
                        <input id="live-q-xp" class="form-control" type="number" min="0" value="9" placeholder="Bu soru için XP">
                    </div>
                    <div class="live-quiz-right-block">
                        <div class="label">Doğru cevap</div>
                        <input id="live-q-correct" class="form-control" placeholder="Doğru seçenek (A/B/C/D ya da doğru/yanlış)">
                        <button id="btn-save-live-quiz-question" class="btn btn-primary" style="width:100%;margin-top:6px;">Soruyu Kaydet / Güncelle</button>
                    </div>
                    <div class="live-quiz-actions-footer">
                        <button id="btn-save-live-quiz" class="btn btn-success">Quizi Kaydet</button>
                        <button id="btn-delete-live-quiz" class="btn btn-danger">Quizi Sil</button>
                    </div>
                </aside>
            </div>

            <div id="live-quiz-start-pane" style="display:none;flex:1;min-height:0;overflow:auto;">
                <div id="live-quiz-list" style="display:grid;gap:8px;"></div>
                <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
                <div class="card" style="margin:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                        <div>
                            <strong id="live-session-title">Canlı oturum yok</strong>
                            <div id="live-session-meta" style="font-size:12px;color:#666;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button id="btn-open-teacher-live-monitor" class="btn" style="background:#eff6ff;color:#1d4ed8;">Tam Ekran Takip</button>
                            <button id="btn-live-session-lock" class="btn btn-warning">Soruyu Kilitle</button>
                            <button id="btn-live-session-next" class="btn btn-primary">Sonraki Soru</button>
                            <button id="btn-live-session-end" class="btn btn-danger">Bitir</button>
                        </div>
                    </div>
                    <div style="margin-top:10px;">
                        <h4 style="margin:0 0 8px;">Canlı Sıralama</h4>
                        <div id="live-session-rank" style="max-height:260px;overflow:auto;"></div>
                    </div>
                    <div style="margin-top:12px;">
                        <h4 style="margin:0 0 8px;">Anlık Cevaplar</h4>
                        <div id="live-session-answer-stats" style="margin-bottom:8px;"></div>
                        <div id="live-session-answer-feed" style="max-height:180px;overflow:auto;"></div>
                    </div>
                </div>
            </div>
            <div id="live-quiz-results-pane" style="display:none;flex:1;min-height:0;overflow:auto;">
                <div class="card" style="margin-top:10px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                        <div style="font-weight:700; color:#1f2937;">Quiz Sonuçları</div>
                        <div style="display:flex;gap:6px;">
                            <button id="btn-download-teacher-quiz-results-modal" class="btn" style="background:#dbeafe;color:#1d4ed8;padding:6px 10px;">Rapor Al</button>
                            <button id="btn-clear-teacher-quiz-results-modal" class="btn" style="background:#eef2ff;color:#1e3a8a;padding:6px 10px;">Liste Temizle</button>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                        <select id="teacher-quiz-session-select-modal" class="form-control" style="max-width:100%;">
                            <option value="">Yapılan quiz seçin</option>
                        </select>
                        <button id="btn-view-teacher-quiz-session-modal" class="btn btn-primary" style="white-space:nowrap;">Listele</button>
                    </div>
                    <div id="teacher-quiz-results-meta-modal" style="font-size:12px;color:#64748b;margin-bottom:6px;"></div>
                    <div id="teacher-quiz-results-list-modal" style="display:flex;flex-direction:column;gap:6px; max-height:260px; overflow:auto;"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Canlı Quiz Davet (Öğrenci) -->
    <div id="live-quiz-invite" class="modal-overlay" style="display:none;z-index:25000;">
        <div class="modal-content live-quiz-invite-card" style="max-width:460px;">
            <h3 style="margin-top:0;color:#ea580c;">🟧 Canlı Quize Katıl</h3>
            <p id="live-quiz-invite-text" style="margin:8px 0 14px;">Öğretmen canlı quiz başlattı.</p>
            <div style="display:flex;gap:8px;">
                <button id="btn-join-live-quiz" class="btn btn-warning" style="flex:1;">Katıl</button>
                <button id="btn-close-live-invite" class="btn" style="flex:1;background:#eee;">Kapat</button>
            </div>
        </div>
    </div>

    <!-- Canlı Quiz Oyuncu (Öğrenci) -->
    <div id="live-quiz-player" class="modal-overlay" style="display:none;z-index:24000;">
        <div class="modal-content modal-large live-player-shell">
            <div class="live-player-head">
                <h3 id="live-player-title">Canlı Quiz</h3>
                <div id="live-player-timer" class="live-player-timer">00 sn</div>
            </div>
            <div id="live-player-question" class="live-player-question"></div>
            <div id="live-player-options" class="live-player-options"></div>
            <div id="live-player-info" class="live-player-info"></div>
            <div style="margin-top:10px;">
                <h4 style="margin:0 0 8px;">Canlı Sıralama</h4>
                <div id="live-player-rank" style="max-height:180px;overflow:auto;"></div>
            </div>
            <button id="btn-close-live-player" class="btn" style="margin-top:12px;width:100%;background:#eee;">Kapat</button>
        </div>
    </div>

    <!-- Canlı Quiz Tam Ekran Takip (Öğretmen) -->
    <div id="teacher-live-monitor-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content teacher-live-monitor-shell">
            <div class="teacher-live-monitor-head">
                <div>
                    <div id="teacher-live-monitor-title" class="teacher-live-monitor-title">Canlı Quiz Takip</div>
                    <div id="teacher-live-monitor-sub" class="teacher-live-monitor-sub">Canlı oturum bekleniyor...</div>
                </div>
                <div class="teacher-live-monitor-actions">
                    <button id="btn-teacher-live-monitor-refresh" class="btn btn-primary">Yenile</button>
                    <button id="btn-close-teacher-live-monitor" class="btn" style="background:#e2e8f0;">Kapat</button>
                </div>
            </div>
            <div id="teacher-live-monitor-metrics" class="teacher-live-monitor-metrics"></div>
            <div id="teacher-live-monitor-list"></div>
        </div>
    </div>

    <div id="flowchart-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content flowchart-shell">
            <div class="flowchart-toolbar">
                <button id="flow-run" class="flowchart-btn run">▶ Çalıştır</button>
                <button id="flow-stop" class="flowchart-btn stop">¦ Durdur</button>
                <button id="flow-assign" class="flowchart-btn" style="display:none;">Ödev Ver</button>
                <button id="flow-delete-assignment" class="flowchart-btn stop" style="display:none;">Ödevi Sil</button>
                <button id="flow-submit-assignment" class="flowchart-btn run" style="display:none;">Cevabı Kontrol Et</button>
                <button id="flow-auto" class="flowchart-btn">Bağla Modu</button>
                <button id="flow-delete" class="flowchart-btn">Sil</button>
                <button id="flow-delete-edge" class="flowchart-btn">Bağlantı Sil</button>
                <button id="flow-clear" class="flowchart-btn">Temizle</button>
                <div id="flow-assignment-timer" class="flowchart-assignment-timer" style="display:none;">⏱️ 0 dk 0 sn</div>
                <button id="flow-close" class="flowchart-btn">Kapat</button>
            </div>
            <div class="flowchart-main">
                <aside class="flowchart-palette" id="flowchart-palette">
                    <button class="flowchart-tool active" data-tool="start" draggable="true"><span class="flow-tool-shape start">start</span></button>
                    <button class="flowchart-tool" data-tool="process" draggable="true"><span class="flow-tool-shape">act</span></button>
                    <button class="flowchart-tool" data-tool="input" draggable="true"><span class="flow-tool-shape input">in</span></button>
                    <button class="flowchart-tool" data-tool="output" draggable="true"><span class="flow-tool-shape output">out</span></button>
                    <button class="flowchart-tool" data-tool="decision" draggable="true"><span class="flow-tool-shape decision"><span>if</span></span></button>
                    <button class="flowchart-tool" data-tool="end" draggable="true"><span class="flow-tool-shape end">end</span></button>
                </aside>
                <section class="flowchart-canvas-wrap">
                    <div id="flowchart-canvas">
                        <svg id="flowchart-svg" xmlns="http://www.w3.org/2000/svg"></svg>
                    </div>
                </section>
                <aside class="flowchart-right">
                    <div class="flowchart-right-head">Çıktı</div>
                    <div id="flowchart-help-text" class="flowchart-help">İpucu: Soldan şekli sürükleyip bırak. "Bağla Modu" ile iki düğümü seçip bağlantı kur. Şekle çift tıklayıp metin düzenle.</div>
                    <div id="flowchart-target-preview" class="flowchart-help" style="display:none; max-height:240px; overflow:auto;"></div>
                    <pre id="flowchart-output">Flowchart çıktısı burada görünecek.</pre>
                </aside>
            </div>
        </div>
    </div>
    <div id="flowchart-assignment-modal" class="modal-overlay" style="display:none; z-index:25032;">
        <div class="modal-content" style="max-width:560px;">
            <h3 style="margin:0 0 10px 0;">Flowchart Ödevi Ver</h3>
            <input id="flow-assignment-title" class="form-control" type="text" placeholder="Ödev başlığı">
            <textarea id="flow-assignment-question" class="form-control" rows="3" placeholder="Soru metni"></textarea>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <input id="flow-assignment-class" class="form-control" type="text" placeholder="Sınıf (boş=tümü)">
                <input id="flow-assignment-section" class="form-control" type="text" placeholder="Şube (opsiyonel)">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <input id="flow-assignment-deadline" class="form-control" type="date">
                <input id="flow-assignment-time" class="form-control" type="time" value="23:59">
            </div>
            <input id="flow-assignment-xp" class="form-control" type="number" min="0" max="20" step="1" value="20" placeholder="XP">
            <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button id="btn-delete-flow-assignment" class="btn btn-danger" style="display:none;">Sil</button>
                <button id="btn-close-flow-assignment" class="btn" style="background:#e5e7eb;">İptal</button>
                <button id="btn-save-flow-assignment" class="btn btn-primary">Ödevi Yayınla</button>
            </div>
        </div>
    </div>
    <div id="flow-node-editor-modal" class="modal-overlay" style="display:none; z-index:25030;">
        <div class="modal-content">
            <h3 id="flow-node-editor-title" style="margin:0 0 10px 0;">Düğüm Düzenle</h3>
            <div class="flow-node-editor-form">
                <div id="flow-node-editor-readonly" style="display:none; background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:10px; color:#334155;">Bu düğüm sabittir.</div>
                <div id="flow-node-editor-input" style="display:none;">
                    <div class="flow-node-editor-label">Değişken Adı</div>
                    <input id="flow-edit-input-var" class="form-control" type="text" placeholder="ornek: x">
                    <div class="flow-node-editor-label">Mesaj</div>
                    <input id="flow-edit-input-msg" class="form-control" type="text" placeholder="ornek: Bir değer girin">
                </div>
                <div id="flow-node-editor-output" style="display:none;">
                    <div class="flow-node-editor-label">Değişken Adı (opsiyonel)</div>
                    <select id="flow-edit-output-var" class="form-control">
                        <option value="">(Değişken seçilmedi)</option>
                    </select>
                    <div class="flow-node-editor-label">Mesaj / Çıktı</div>
                    <input id="flow-edit-output-msg" class="form-control" type="text" placeholder='ornek: Sonuç'>
                </div>
                <div id="flow-node-editor-process" style="display:none;">
                    <div class="flow-node-editor-row three">
                        <div>
                            <div class="flow-node-editor-label">Sonuç Değişkeni</div>
                            <input id="flow-edit-proc-result" class="form-control" type="text" placeholder="sonuc">
                        </div>
                        <div class="flow-node-editor-label" style="margin:0 0 10px 0; text-align:center;">=</div>
                        <div></div>
                    </div>
                    <div class="flow-node-editor-row three">
                        <div>
                            <div class="flow-node-editor-label">1. Değişken</div>
                            <input id="flow-edit-proc-left" class="form-control" type="text" placeholder="a">
                        </div>
                        <div>
                            <div class="flow-node-editor-label">İşlem</div>
                            <select id="flow-edit-proc-op" class="form-control">
                                <option value="+">+</option>
                                <option value="-">-</option>
                                <option value="*">*</option>
                                <option value="/">/</option>
                            </select>
                        </div>
                        <div>
                            <div class="flow-node-editor-label">2. Değişken</div>
                            <input id="flow-edit-proc-right" class="form-control" type="text" placeholder="b">
                        </div>
                    </div>
                </div>
                <div id="flow-node-editor-decision" style="display:none;">
                    <div class="flow-node-editor-row three">
                        <div>
                            <div class="flow-node-editor-label">Değişken</div>
                            <input id="flow-edit-if-left" class="form-control" type="text" placeholder="x">
                        </div>
                        <div>
                            <div class="flow-node-editor-label">Koşul</div>
                            <select id="flow-edit-if-op" class="form-control">
                                <option value="==">==</option>
                                <option value="!=">!=</option>
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value=">=">&gt;=</option>
                                <option value="<=">&lt;=</option>
                            </select>
                        </div>
                        <div>
                            <div class="flow-node-editor-label">Veri</div>
                            <input id="flow-edit-if-right" class="form-control" type="number" step="any" placeholder="10">
                        </div>
                    </div>
                </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
                <button id="btn-flow-node-cancel" class="btn" style="background:#e5e7eb;">İptal</button>
                <button id="btn-flow-node-save" class="btn btn-primary">Kaydet</button>
            </div>
        </div>
    </div>
    <div id="flow-runtime-input-modal" class="modal-overlay" style="display:none; z-index:25031;">
        <div class="modal-content">
            <h3 style="margin:0 0 10px 0;">Veri Girişi</h3>
            <div id="flow-runtime-input-question" style="margin-bottom:8px; color:#334155;">Değer girin</div>
            <input id="flow-runtime-input-value" class="form-control" type="text" placeholder="Değer">
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
                <button id="btn-flow-runtime-input-cancel" class="btn" style="background:#e5e7eb;">İptal</button>
                <button id="btn-flow-runtime-input-ok" class="btn btn-primary">Tamam</button>
            </div>
        </div>
    </div>

    <!-- Öğrenci Sertifikaları -->
    <div id="certificates-modal" class="modal-overlay" style="display:none;z-index:23000;">
        <div class="modal-content modal-large certificate-shell">
            <div class="certificate-modal-head">
                <h2 style="margin:0;">Sertifikalarım</h2>
                <div style="display:flex;gap:8px;">
                    <button id="btn-download-certificate" class="btn btn-primary">Önizle / Yazdır</button>
                    <button id="btn-close-certificates" class="btn" style="background:#eee;">Kapat</button>
                </div>
            </div>
            <div id="student-certificate-card" class="student-certificate">
                <img src="logo.png" alt="Logo" class="certificate-logo">
                <div class="certificate-kicker">EĞİTİM PORTALI</div>
                <div class="certificate-title">BAŞARI SERTİFİKASI</div>
                <p id="certificate-award-text" class="certificate-text">
                    Bu sertifika, platformdaki düzenli katılımı ve öğrenme sürecindeki başarılı ilerlemesi nedeniyle verilmiştir.
                </p>
                <div id="certificate-student-name" class="certificate-student-name">Öğrenci Adı Soyadı</div>
                <div class="certificate-meta-row">
                    <div class="certificate-meta-item">
                        <span class="k">Sınıf / Şube</span>
                        <span id="certificate-class" class="v">-</span>
                    </div>
                    <div class="certificate-meta-item">
                        <span class="k">Toplam XP</span>
                        <span id="certificate-xp" class="v">0 XP</span>
                    </div>
                    <div class="certificate-meta-item">
                        <span class="k">Tamamlama</span>
                        <span id="certificate-completion" class="v">%0</span>
                    </div>
                    <div class="certificate-meta-item">
                        <span class="k">Veriliş Tarihi</span>
                        <span id="certificate-date" class="v">-</span>
                    </div>
                </div>
                <div class="certificate-footer-note">
                    Öğrencinin sistemde gösterdiği gayret, disiplin ve başarıya ithafen takdim edilmiştir.
                </div>
            </div>
        </div>
    </div>

    <div id="teacher-certificates-modal" class="modal-overlay" style="display:none;z-index:23000;">
        <div class="modal-content modal-large certificate-shell">
            <div class="certificate-modal-head">
                <h2 style="margin:0;">Sertifika Yönetimi</h2>
                <button id="btn-close-teacher-certificates" class="btn" style="background:#eee;">Kapat</button>
            </div>
            <p class="teacher-cert-note">Sınıf ve şube seçerek tek öğrenci sertifikası veya tüm sınıf sertifikalarını tek dosya halinde oluşturabilirsiniz.</p>
            <div class="teacher-cert-toolbar">
                <div>
                    <label>Sınıf</label>
                    <select id="teacher-cert-class" class="form-control">
                        <option value="">Tümü</option>
                    </select>
                </div>
                <div>
                    <label>Şube</label>
                    <select id="teacher-cert-section" class="form-control">
                        <option value="">Tümü</option>
                    </select>
                </div>
                <div style="grid-column: span 2;">
                    <label>Öğrenci</label>
                    <select id="teacher-cert-student" class="form-control">
                        <option value="">Öğrenci seçin</option>
                    </select>
                </div>
            </div>
            <div class="teacher-cert-actions">
                <button id="btn-download-selected-certificate" class="btn btn-primary">Seçili Öğrenciyi Önizle</button>
                <button id="btn-download-class-certificates" class="btn btn-success">Filtredeki Tümünü Önizle</button>
            </div>
            <div id="teacher-certificate-card" class="student-certificate">
                <img src="logo.png" alt="Logo" class="certificate-logo">
                <div class="certificate-kicker">EĞİTİM PORTALI</div>
                <div class="certificate-title">BAŞARI SERTİFİKASI</div>
                <p id="teacher-certificate-award-text" class="certificate-text">
                    Bu sertifika, platformdaki düzenli katılımı ve öğrenme sürecindeki başarılı ilerlemesi nedeniyle verilmiştir.
                </p>
                <div id="teacher-certificate-student-name" class="certificate-student-name">Öğrenci Adı Soyadı</div>
                <div class="certificate-meta-row">
                    <div class="certificate-meta-item">
                        <span class="k">Sınıf / Şube</span>
                        <span id="teacher-certificate-class" class="v">-</span>
                    </div>
                    <div class="certificate-meta-item">
                        <span class="k">Toplam XP</span>
                        <span id="teacher-certificate-xp" class="v">0 XP</span>
                    </div>
                    <div class="certificate-meta-item">
                        <span class="k">Tamamlama</span>
                        <span id="teacher-certificate-completion" class="v">%0</span>
                    </div>
                    <div class="certificate-meta-item">
                        <span class="k">Veriliş Tarihi</span>
                        <span id="teacher-certificate-date" class="v">-</span>
                    </div>
                </div>
                <div class="certificate-footer-note">
                    Öğrencinin sistemde gösterdiği gayret, disiplin ve başarıya ithafen takdim edilmiştir.
                </div>
            </div>
        </div>
    </div>


    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
    <script type="module" src="script.js"></script>
</body>
</html>


