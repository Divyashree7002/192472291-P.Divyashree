const http = require('http');

const routes = [
  { path: '/', name: 'Landing Page' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/camera', name: 'Live Camera Workspace' },
  { path: '/studio', name: 'Design Studio' },
  { path: '/recommendations', name: 'Recommendations' },
  { path: '/history', name: 'Project History' },
  { path: '/preferences', name: 'User Preferences' },
  { path: '/settings', name: 'Settings' }
];

function fetchEndpoint(urlPath) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method: 'GET',
      headers: { 'Connection': 'close', 'Accept': '*/*' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, bodyLength: body.length, hasRoot: body.includes('id="root"') });
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.setTimeout(12000, () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
    req.end();
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function verifyAll() {
  console.log('================================================================');
  console.log('  SmartSpace AI - Frontend Route & CSS Compilation Test');
  console.log('================================================================\n');

  let passedRoutes = 0;
  for (const { path, name } of routes) {
    const res = await fetchEndpoint(path);
    if (res.statusCode === 200 && res.hasRoot) {
      console.log(`[PASS] Route: ${path.padEnd(20)} (${name.padEnd(24)}) -> Status: 200 OK (${res.bodyLength} bytes)`);
      passedRoutes++;
    } else {
      console.log(`[FAIL] Route: ${path.padEnd(20)} (${name.padEnd(24)}) -> Error: ${res.error || res.statusCode}`);
    }
    await delay(100);
  }

  console.log('\n--- CSS & Transpiled Component Modules ---');
  const modules = [
    { path: '/src/index.css', isTypeOnly: false },
    { path: '/src/main.tsx', isTypeOnly: false },
    { path: '/src/App.tsx', isTypeOnly: false },
    { path: '/src/types/index.ts', isTypeOnly: true },
    { path: '/src/services/preferenceService.ts', isTypeOnly: false },
    { path: '/src/pages/LandingPage.tsx', isTypeOnly: false },
    { path: '/src/pages/DashboardPage.tsx', isTypeOnly: false },
    { path: '/src/pages/CameraWorkspacePage.tsx', isTypeOnly: false },
    { path: '/src/pages/DesignStudioPage.tsx', isTypeOnly: false },
    { path: '/src/pages/RecommendationsPage.tsx', isTypeOnly: false },
    { path: '/src/pages/ProjectHistoryPage.tsx', isTypeOnly: false },
    { path: '/src/pages/PreferencesPage.tsx', isTypeOnly: false },
    { path: '/src/pages/SettingsPage.tsx', isTypeOnly: false },
    { path: '/src/components/camera/CameraViewfinder.tsx', isTypeOnly: false },
    { path: '/src/components/camera/RoomConfigPanel.tsx', isTypeOnly: false },
    { path: '/src/components/studio/ViewportPlaceholder.tsx', isTypeOnly: false },
    { path: '/src/components/studio/DesignAlternatives.tsx', isTypeOnly: false },
    { path: '/src/components/studio/MaterialPalette.tsx', isTypeOnly: false },
    { path: '/src/components/studio/FurnitureCatalog.tsx', isTypeOnly: false },
    { path: '/src/components/recommendations/RecommendationCard.tsx', isTypeOnly: false },
    { path: '/src/components/recommendations/ExplainabilityModal.tsx', isTypeOnly: false },
    { path: '/src/components/preferences/StyleSelector.tsx', isTypeOnly: false },
    { path: '/src/components/preferences/ColorPalettePicker.tsx', isTypeOnly: false },
    { path: '/src/components/preferences/LifestyleToggleGroup.tsx', isTypeOnly: false },
    { path: '/src/components/history/ProjectCard.tsx', isTypeOnly: false },
    { path: '/src/components/history/ProjectFilterBar.tsx', isTypeOnly: false },
    { path: '/src/components/common/Navbar.tsx', isTypeOnly: false },
    { path: '/src/components/common/Sidebar.tsx', isTypeOnly: false },
    { path: '/src/components/common/AppLayout.tsx', isTypeOnly: false },
    { path: '/src/components/common/Footer.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Button.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Card.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Badge.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Drawer.tsx', isTypeOnly: false },
    { path: '/src/components/ui/StatusIndicator.tsx', isTypeOnly: false },
    { path: '/src/components/ui/MetricCard.tsx', isTypeOnly: false },
    { path: '/src/components/ui/FeatureCard.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Input.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Select.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Slider.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Modal.tsx', isTypeOnly: false },
    { path: '/src/components/ui/Alert.tsx', isTypeOnly: false },
    { path: '/src/components/ui/ToastContainer.tsx', isTypeOnly: false }
  ];

  let passedModules = 0;
  for (const mod of modules) {
    const res = await fetchEndpoint(mod.path);
    const isValid = res.statusCode === 200 && (mod.isTypeOnly || res.bodyLength > 50);
    if (isValid) {
      console.log(`[OK]   ${mod.path.padEnd(55)} -> ${res.bodyLength} bytes`);
      passedModules++;
    } else {
      console.log(`[FAIL] ${mod.path.padEnd(55)} -> Error: ${res.error || res.statusCode}`);
    }
    await delay(50);
  }

  console.log('\n================================================================');
  console.log(`Final Verification Result:`);
  console.log(`  Routes Verified:   ${passedRoutes}/${routes.length} PASSED`);
  console.log(`  Modules & CSS:     ${passedModules}/${modules.length} PASSED`);
  console.log('================================================================');

  process.exit(passedRoutes === routes.length && passedModules === modules.length ? 0 : 1);
}

verifyAll();
