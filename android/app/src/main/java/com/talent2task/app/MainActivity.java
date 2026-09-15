package com.talent2task.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    // =========================================================================
    // TALENT2TASK CONFIGURATION
    // You can also change this in res/values/strings.xml -> "web_app_url"
    // =========================================================================
    private static final String DEFAULT_LIVE_URL = "https://talent2task.netlify.app";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout offlineContainer;
    private Button btnRetry;

    // File upload handlers for WebChromeClient
    private ValueCallback<Uri[]> filePathCallback;
    private String cameraPhotoPath;
    private ActivityResultLauncher<Intent> fileChooserLauncher;

    // Permissions launcher
    private ActivityResultLauncher<String[]> requestPermissionsLauncher;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;

    // Back-press double tap to exit tracker
    private long backPressedTime = 0;
    private Toast exitToast;

    // Network connectivity monitor
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize UI Elements
        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        offlineContainer = findViewById(R.id.offlineContainer);
        btnRetry = findViewById(R.id.btnRetry);

        // Setup file picker and permissions launchers
        setupActivityLaunchers();

        // Setup Swipe to Refresh
        setupSwipeRefresh();

        // Configure WebView settings
        setupWebViewSettings();

        // Setup Chrome & View clients
        setupWebViewClients();

        // Setup Hardware Back Button handling
        setupBackButtonHandler();

        // Setup Download Listener
        setupDownloadListener();

        // Setup Retry Button
        btnRetry.setOnClickListener(v -> retryLoading());

        // Setup Live Network Auto-Recovery
        setupNetworkCallback();

        // Request initial runtime permissions (Location & Camera)
        checkAndRequestAppPermissions();

        // Load the live HTTPS website
        loadLiveWebApp();
    }

    /**
     * Gets the configured live HTTPS website URL from strings.xml or defaults.
     */
    private String getLiveWebAppUrl() {
        try {
            String url = getString(R.string.web_app_url);
            if (url != null && !url.trim().isEmpty() && !url.contains("localhost")) {
                return url.trim();
            }
        } catch (Exception ignored) {}
        return DEFAULT_LIVE_URL;
    }

    /**
     * Loads the target web app URL in the WebView.
     */
    private void loadLiveWebApp() {
        if (!isNetworkAvailable()) {
            showOfflineView(true);
            return;
        }

        showOfflineView(false);
        String liveUrl = getLiveWebAppUrl();
        webView.loadUrl(liveUrl);
    }

    private void retryLoading() {
        if (isNetworkAvailable()) {
            showOfflineView(false);
            if (webView.getUrl() != null && !webView.getUrl().isEmpty()) {
                webView.reload();
            } else {
                loadLiveWebApp();
            }
        } else {
            Toast.makeText(this, R.string.error_offline_title, Toast.LENGTH_SHORT).show();
        }
    }

    private void showOfflineView(boolean show) {
        offlineContainer.setVisibility(show ? View.VISIBLE : View.GONE);
        swipeRefresh.setVisibility(show ? View.GONE : View.VISIBLE);
        if (show) {
            progressBar.setVisibility(View.GONE);
            swipeRefresh.setRefreshing(false);
        }
    }

    /**
     * Configures modern WebView engine parameters for maximum compatibility with
     * React 19, SQLite WASM, Leaflet Maps, and LocalStorage.
     */
    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebViewSettings() {
        WebSettings settings = webView.getSettings();

        // Enable JavaScript and modern Web APIs
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Geolocation for Talent2Task GPS Radar
        settings.setGeolocationEnabled(true);

        // Viewport and responsiveness
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // File access for uploads
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // Media playback without gesture (for voice prompts / audio guides)
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Caching: Network first, cache fallback
        if (isNetworkAvailable()) {
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        // Mixed content (block insecure content in production)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        // Cookies
        CookieManager.getInstance().setAcceptCookie(true);

        // User Agent Enhancement
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " Talent2Task-AndroidApp/1.0");

        // Hardware layer acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
    }

    /**
     * Custom WebChromeClient and WebViewClient implementations
     */
    private void setupWebViewClients() {
        // WebViewClient: Handles URL navigation, external apps (tel, mail, maps), and network error states
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                return handleUrlScheme(uri.toString());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrlScheme(url);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
                showOfflineView(false);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    showOfflineView(true);
                }
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                if (failingUrl.equals(view.getUrl()) || failingUrl.equals(getLiveWebAppUrl())) {
                    showOfflineView(true);
                }
            }
        });

        // WebChromeClient: Handles progress bar, file chooser (camera/gallery), GPS prompts, and alerts
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                }
            }

            // HTML5 Geolocation Permission handler for live GPS radar
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (hasLocationPermissions()) {
                    callback.invoke(origin, true, false);
                } else {
                    pendingGeoOrigin = origin;
                    pendingGeoCallback = callback;
                    requestPermissionsLauncher.launch(new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    });
                }
            }

            // HTML5 File Chooser handler (<input type="file">)
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent takePictureIntent = null;
                if (fileChooserParams.isCaptureEnabled() || containsImageType(fileChooserParams.getAcceptTypes())) {
                    takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
                        File photoFile = createImageFile();
                        if (photoFile != null) {
                            cameraPhotoPath = photoFile.getAbsolutePath();
                            Uri photoURI = FileProvider.getUriForFile(
                                    MainActivity.this,
                                    getApplicationContext().getPackageName() + ".fileprovider",
                                    photoFile
                            );
                            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                        }
                    }
                }

                Intent contentSelectionIntent = fileChooserParams.createIntent();
                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Select File or Photo");

                if (takePictureIntent != null && cameraPhotoPath != null) {
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{takePictureIntent});
                }

                try {
                    fileChooserLauncher.launch(chooserIntent);
                } catch (ActivityNotFoundException e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }

                return true;
            }

            // WebRTC Permissions (Microphone, Camera)
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }

            // JavaScript Alert Dialog
            @Override
            public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Talent2Task")
                        .setMessage(message)
                        .setPositiveButton(android.R.string.ok, (dialog, which) -> result.confirm())
                        .setOnCancelListener(dialog -> result.cancel())
                        .create()
                        .show();
                return true;
            }

            // JavaScript Confirm Dialog
            @Override
            public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Talent2Task")
                        .setMessage(message)
                        .setPositiveButton(android.R.string.ok, (dialog, which) -> result.confirm())
                        .setNegativeButton(android.R.string.cancel, (dialog, which) -> result.cancel())
                        .setOnCancelListener(dialog -> result.cancel())
                        .create()
                        .show();
                return true;
            }
        });
    }

    /**
     * Intercepts and launches native apps for external URL protocols:
     * - tel: (Direct phone dialer for recruiters/workers)
     * - mailto: (Email client)
     * - whatsapp: / https://wa.me/ (WhatsApp chat)
     * - geo: / maps: (Google Maps directions to gig)
     * - intent: (Android intent URLs)
     */
    private boolean handleUrlScheme(String url) {
        if (url == null) return false;

        if (url.startsWith("tel:")) {
            Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
            startActivity(intent);
            return true;
        } else if (url.startsWith("mailto:")) {
            Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
            startActivity(intent);
            return true;
        } else if (url.startsWith("sms:")) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
            return true;
        } else if (url.startsWith("geo:") || url.contains("maps.google.com") || url.contains("google.com/maps")) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            try {
                startActivity(intent);
                return true;
            } catch (ActivityNotFoundException e) {
                return false; // Fallback to loading in WebView
            }
        } else if (url.startsWith("whatsapp:") || url.contains("api.whatsapp.com") || url.contains("wa.me")) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            } catch (Exception e) {
                Toast.makeText(this, "WhatsApp is not installed", Toast.LENGTH_SHORT).show();
                return true;
            }
        } else if (url.startsWith("intent:")) {
            try {
                Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                if (intent != null) {
                    if (getPackageManager().resolveActivity(intent, 0) != null) {
                        startActivity(intent);
                        return true;
                    }
                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                    if (fallbackUrl != null) {
                        webView.loadUrl(fallbackUrl);
                        return true;
                    }
                }
            } catch (Exception ignored) {}
            return true;
        }

        // Allow standard HTTP/HTTPS URLs to load inside this WebView
        return false;
    }

    /**
     * Pull down from the top to refresh the live website.
     */
    private void setupSwipeRefresh() {
        swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent, R.color.primary_dark);
        swipeRefresh.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                webView.reload();
            } else {
                swipeRefresh.setRefreshing(false);
                Toast.makeText(MainActivity.this, R.string.error_offline_title, Toast.LENGTH_SHORT).show();
            }
        });
    }

    /**
     * Handles the Android Hardware Back Button:
     * - If WebView has browsing history, navigates back in history.
     * - If at root page, prompts "Press back again to exit".
     */
    private void setupBackButtonHandler() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (offlineContainer.getVisibility() == View.VISIBLE) {
                    finish();
                    return;
                }

                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        if (exitToast != null) exitToast.cancel();
                        finish();
                    } else {
                        exitToast = Toast.makeText(MainActivity.this, R.string.toast_exit_prompt, Toast.LENGTH_SHORT);
                        exitToast.show();
                    }
                    backPressedTime = System.currentTimeMillis();
                }
            }
        });
    }

    /**
     * Handles file download requests (PDF reports, receipts, worker sheets).
     */
    private void setupDownloadListener() {
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.setMimeType(mimeType);
                    String cookies = CookieManager.getInstance().getCookie(url);
                    request.addRequestHeader("cookie", cookies);
                    request.addRequestHeader("User-Agent", userAgent);
                    request.setDescription("Downloading Talent2Task Document...");
                    request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType));
                    request.allowScanningByMediaScanner();
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, contentDisposition, mimeType));

                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (dm != null) {
                        dm.enqueue(request);
                        Toast.makeText(getApplicationContext(), "Downloading file...", Toast.LENGTH_LONG).show();
                    }
                } catch (Exception e) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    try {
                        startActivity(intent);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Automatically reloads the web page when network connectivity recovers.
     */
    private void setupNetworkCallback() {
        try {
            connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (connectivityManager != null) {
                NetworkRequest request = new NetworkRequest.Builder()
                        .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                        .build();

                networkCallback = new ConnectivityManager.NetworkCallback() {
                    @Override
                    public void onAvailable(@NonNull Network network) {
                        runOnUiThread(() -> {
                            if (offlineContainer.getVisibility() == View.VISIBLE) {
                                showOfflineView(false);
                                webView.reload();
                            }
                        });
                    }
                };

                connectivityManager.registerNetworkCallback(request, networkCallback);
            }
        } catch (Exception ignored) {}
    }

    /**
     * Registers Activity Result launchers for File Choosers and Permissions.
     */
    private void setupActivityLaunchers() {
        // File Chooser Launcher
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (filePathCallback == null) return;

                    Uri[] results = null;
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        Intent data = result.getData();
                        if (data == null || data.getData() == null) {
                            if (cameraPhotoPath != null) {
                                results = new Uri[]{Uri.fromFile(new File(cameraPhotoPath))};
                            }
                        } else {
                            String dataString = data.getDataString();
                            if (dataString != null) {
                                results = new Uri[]{Uri.parse(dataString)};
                            }
                        }
                    }

                    filePathCallback.onReceiveValue(results);
                    filePathCallback = null;
                    cameraPhotoPath = null;
                }
        );

        // Permissions Request Launcher
        requestPermissionsLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestMultiplePermissions(),
                permissions -> {
                    boolean locationGranted = Boolean.TRUE.equals(permissions.get(Manifest.permission.ACCESS_FINE_LOCATION)) ||
                            Boolean.TRUE.equals(permissions.get(Manifest.permission.ACCESS_COARSE_LOCATION));

                    if (pendingGeoCallback != null && pendingGeoOrigin != null) {
                        pendingGeoCallback.invoke(pendingGeoOrigin, locationGranted, false);
                        pendingGeoCallback = null;
                        pendingGeoOrigin = null;
                    }
                }
        );
    }

    private void checkAndRequestAppPermissions() {
        List<String> neededPermissions = new ArrayList<>();

        if (!hasLocationPermissions()) {
            neededPermissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
            neededPermissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.CAMERA);
        }

        if (!neededPermissions.isEmpty()) {
            requestPermissionsLauncher.launch(neededPermissions.toArray(new String[0]));
        }
    }

    private boolean hasLocationPermissions() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private File createImageFile() {
        try {
            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
            String imageFileName = "JPEG_" + timeStamp + "_";
            File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
            return File.createTempFile(imageFileName, ".jpg", storageDir);
        } catch (IOException e) {
            return null;
        }
    }

    private boolean containsImageType(String[] acceptTypes) {
        if (acceptTypes == null) return false;
        for (String type : acceptTypes) {
            if (type != null && (type.contains("image") || type.contains("jpg") || type.contains("png"))) {
                return true;
            }
        }
        return false;
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Network network = cm.getActiveNetwork();
            if (network == null) return false;
            NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
            return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
        } else {
            android.net.NetworkInfo activeNetworkInfo = cm.getActiveNetworkInfo();
            return activeNetworkInfo != null && activeNetworkInfo.isConnected();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onDestroy() {
        if (connectivityManager != null && networkCallback != null) {
            try {
                connectivityManager.unregisterNetworkCallback(networkCallback);
            } catch (Exception ignored) {}
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
