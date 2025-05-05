#include <algorithm>
#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <vector>
#include <ArduinoJson.h>

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

#define DETECTION_INTERVAL 5000
#define COLOR_SIMILARITY_THRESHOLD 25

WebServer server(80);
const char* ssid = "ESP32-Parking";
const char* password = "parking123";

struct ParkingSpace {
  int x1, y1, x2, y2;
  int avgBrightness;
  bool occupied;
};

camera_config_t config;  // Global camera config
bool setupMode = true;
bool detectionReady = false;  // Used to switch to RGB mode only once
std::vector<ParkingSpace> parkingSpaces;
unsigned long lastDetectionTime = 0;

void setup() {
  Serial.begin(115200);

  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    return;
  }

  WiFi.softAP(ssid, password);
  Serial.println("WiFi AP started");

  server.on("/image", HTTP_GET, []() {
    camera_fb_t* fb = esp_camera_fb_get();
    if(fb) {
      Serial.printf("pixformat: %d, resolution: %dx%d\n", fb->format, fb->width, fb->height);
    }
    if (!fb) {
      server.send(500, "text/plain", "Camera capture failed");
      return;
    }
    server.send_P(200, "image/jpeg", (const char*)fb->buf, fb->len);
    esp_camera_fb_return(fb);
  });


  server.on("/", HTTP_GET, []() {
  String html = "<html><head><style>";
  html += "body{font-family:sans-serif;text-align:center}";
  html += "button{padding:10px;margin:5px;background:#4CAF50;color:white;border:none;cursor:pointer}";
  html += "#imgContainer{position:relative;display:inline-block;border:1px solid #ccc}";
  html += "#parkingImg{max-width:100%;user-select:none;-webkit-user-drag:none}";
  html += ".circle{width:10px;height:10px;background:blue;border-radius:50%;position:absolute;transform:translate(-50%,-50%)}";
  html += ".rectangle{border:2px solid blue;position:absolute}";
  html += "</style></head><body>";

  if (setupMode) {
    html += "<h1>Parking Setup</h1>";
    html += "<div id='imgContainer'>";
    html += "<img id='parkingImg' src='/image?t=" + String(millis()) + "'/>";
    html += "<div id='overlay' style='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;'></div>";
    html += "</div>";
    html += "<br><button onclick='startDrawing()'>Draw</button>";
    html += "<button onclick='finishDrawing()'>Finish</button>";
    html += "<button onclick='retakeImage()'>Retake</button>";
    html += "<button onclick='saveSpaces()'>Save</button>";
    html += "<p id='spaceCount'>0 spaces</p>";

    html += "<script>";
    html += "let current=[],all=[],isDrawing=false;";
    html += "function startDrawing(){isDrawing=true;document.getElementById('parkingImg').style.cursor='crosshair';}";
    html += "function finishDrawing(){";
    html += "if(current.length===4){";
    html += "console.log('Drawing rectangle...');";
    html += "all.push(current); drawRectangle(current); current=[]; updateCount();";
    html += "}}";
    html += "function updateCount(){document.getElementById('spaceCount').innerText=all.length+' spaces';}";
    html += "function retakeImage(){current=[];all=[];updateCount();document.getElementById('overlay').innerHTML='';document.getElementById('parkingImg').src='/image?t='+Date.now();isDrawing=false;}";
    html += "function saveSpaces(){let img=document.getElementById('parkingImg');let rect=img.getBoundingClientRect();let sx=img.naturalWidth/rect.width,sy=img.naturalHeight/rect.height;";
    html += "let norm=all.map(s=>({x1:Math.min(...s.map(p=>p.x))*sx|0,y1:Math.min(...s.map(p=>p.y))*sy|0,x2:Math.max(...s.map(p=>p.x))*sx|0,y2:Math.max(...s.map(p=>p.y))*sy|0}));";
    html += "fetch('/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(norm)}).then(()=>location.reload());}";
    html += "function drawPoint(x,y){let d=document.createElement('div');d.className='circle';d.style.left=x+'px';d.style.top=y+'px';document.getElementById('overlay').appendChild(d);}";
    html += "function drawRectangle(p){let minX=Math.min(...p.map(pt=>pt.x)), maxX=Math.max(...p.map(pt=>pt.x));";
    html += "let minY=Math.min(...p.map(pt=>pt.y)), maxY=Math.max(...p.map(pt=>pt.y));";
    html += "let r=document.createElement('div');r.className='rectangle';r.style.left=minX+'px';r.style.top=minY+'px';";
    html += "r.style.width=(maxX-minX)+'px'; r.style.height=(maxY-minY)+'px';document.getElementById('overlay').appendChild(r);}";
    html += "document.getElementById('parkingImg').addEventListener('click',e=>{";
    html += "if(!isDrawing)return;";
    html += "let r=e.target.getBoundingClientRect();";
    html += "let x=e.clientX-r.left, y=e.clientY-r.top;";
    html += "current.push({x:x,y:y}); drawPoint(x,y); if(current.length===4) finishDrawing();";
    html += "});";
    html += "</script>";
  } else {
    int free = 0;
    for (const auto& s : parkingSpaces) if (!s.occupied) free++;
    html += "<h1>Parking Monitor</h1>";
    html += "<h2>Free: " + String(free) + " / " + String(parkingSpaces.size()) + "</h2>";
    html += "<img src='/image?t=" + String(millis()) + "' style='max-width:100%;'/>";
    html += "<p>Auto-refresh every 5s</p>";
    html += "<script>setTimeout(()=>location.reload(),5000);</script>";
  }

  html += "</body></html>";
  server.send(200, "text/html", html);
});



  server.on("/status", HTTP_GET, []() {
    int free = 0;
    for (const auto& s : parkingSpaces) if (!s.occupied) free++;
    DynamicJsonDocument doc(1024);
    doc["free"] = free;
    doc["total"] = parkingSpaces.size();
    String out; serializeJson(doc, out);
    server.send(200, "application/json", out);
  });



  server.on("/setup", HTTP_POST, []() { 
    Serial.println("Received /setup request");

    DynamicJsonDocument doc(2048);
    DeserializationError err = deserializeJson(doc, server.arg("plain"));
    if (err) {
      Serial.println("JSON parse error");
      server.send(400, "text/plain", "Invalid JSON");
      return;
    }

    esp_camera_deinit();
    delay(200);
    config.pixel_format = PIXFORMAT_GRAYSCALE;
    config.frame_size = FRAMESIZE_SVGA; // manja rezolucija za manje RAM-a

    if (esp_camera_init(&config) != ESP_OK) {
      Serial.println("Grayscale camera init failed");
      server.send(500, "text/plain", "Grayscale init failed");
      return;
    }

    camera_fb_t* fb = esp_camera_fb_get();
    if(fb) {
      Serial.printf("pixformat: %d, resolution: %dx%d\n", fb->format, fb->width, fb->height);
    }
    if (!fb) {
      Serial.println("Failed to capture RGB frame");
      server.send(500, "text/plain", "Frame capture failed");
      return;
    }

    // Scale factors from 1600x1200 JPEG to 800x600 GRAYSCALE
    float xScale = 800.0 / 1600.0;
    float yScale = 600.0 / 1200.0;

    parkingSpaces.clear();
    for (JsonObject s : doc.as<JsonArray>()) {
      ParkingSpace p;
      p.x1 = constrain(int(s["x1"].as<int>() * xScale), 0, fb->width - 1);
      p.y1 = constrain(int(s["y1"].as<int>() * yScale), 0, fb->height - 1);
      p.x2 = constrain(int(s["x2"].as<int>() * xScale), 0, fb->width - 1);
      p.y2 = constrain(int(s["y2"].as<int>() * yScale), 0, fb->height - 1);

      if (p.x2 < p.x1) std::swap(p.x1, p.x2);
      if (p.y2 < p.y1) std::swap(p.y1, p.y2);

      long sum = 0;
      int count = 0;
      for (int y = p.y1; y < p.y2; y++) {
        for (int x = p.x1; x < p.x2; x++) {
          int o = y * fb->width + x;
          if (o >= fb->len) continue;
          uint8_t brightness = fb->buf[o];
          sum += brightness;
          count++;
        }
      }
      if (count > 0) {
        p.avgBrightness = sum / count;
      }
      p.occupied = false;
      parkingSpaces.push_back(p);
    }

    esp_camera_fb_return(fb);
    esp_camera_deinit();


    setupMode = false;
    detectionReady = true;
    lastDetectionTime = millis();
    Serial.println("Setup complete. Switching to monitor mode.");
    server.send(200, "application/json", "{\"status\":\"ok\"}");
  });

  server.begin();
  Serial.println("Server started");
}

void loop() {



  server.handleClient();

  if (!setupMode && detectionReady && millis() - lastDetectionTime > DETECTION_INTERVAL) {



    Serial.printf("Free heap: %d bytes\n", ESP.getFreeHeap());
    Serial.printf("Minimum ever free heap: %d bytes\n", ESP.getMinFreeHeap());
    Serial.printf("Free PSRAM (if available): %d bytes\n", ESP.getFreePsram());



    Serial.println("Running parking detection...");

   // Ensure camera is in grayscale mode for detection
    esp_camera_deinit();
    delay(200);
    config.pixel_format = PIXFORMAT_GRAYSCALE;
    config.frame_size = FRAMESIZE_SVGA;
    

    esp_err_t initResult = esp_camera_init(&config);
    int retryCount = 0;
    while (initResult != ESP_OK && retryCount < 5) {
      Serial.printf("Camera init failed (%d), retrying...\n", initResult);
      delay(1000);
      initResult = esp_camera_init(&config);
      retryCount++;
    }
    if (initResult != ESP_OK) {
      Serial.println("Camera still not detected after retries.");
      return;
    }




    camera_fb_t* fb = esp_camera_fb_get();
    if(fb) {
      Serial.printf("pixformat: %d, resolution: %dx%d\n", fb->format, fb->width, fb->height);
    }
    if (!fb) {
      Serial.println("Failed to get RGB frame");
      return;
    }

    for (size_t i = 0; i < parkingSpaces.size(); i++) {
  auto& s = parkingSpaces[i];
  int diff = 0, count = 0;
  long sumBrightness = 0;

  for (int y = s.y1; y < s.y2; y += 5) {
    for (int x = s.x1; x < s.x2; x += 5) {
      int o = y * fb->width + x;
      if (o >= fb->len) continue;
      uint8_t brightness = fb->buf[o];
      sumBrightness += brightness;
      int d = abs(brightness - s.avgBrightness);
      count++;
      if (d > COLOR_SIMILARITY_THRESHOLD) diff++;
    }
  }

  int newAvg = (count > 0) ? sumBrightness / count : 0;
  int brightnessDelta = abs(newAvg - s.avgBrightness);
  s.occupied = diff > (count / 5);

  Serial.printf("Space %d - initial: %d, current: %d, delta: %d -> %s\n",
                (int)i, s.avgBrightness, newAvg, brightnessDelta,
                s.occupied ? "OCCUPIED" : "FREE");
}

    esp_camera_fb_return(fb);
    esp_camera_deinit();

    lastDetectionTime = millis();
    Serial.println("Detection done.");
  }
}