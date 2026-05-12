<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>MediFlow – AI-Powered Remote Patient Monitoring</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <div id="root"></div>
</body>
</html>
