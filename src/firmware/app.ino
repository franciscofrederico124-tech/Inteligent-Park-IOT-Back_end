// code do esp32 funcional. ( v1 )


#include <Ultrasonic.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char *ssid = "Assembly";
const char *password = "Orieljoelcapitadasilva";
const char *apiBase = "http://192.168.8.84:3000";

// Corrigido: Para concatenar em tempo de execução, usamos String ou montamos no setup
String sendUrl = String(apiBase) + "/park/data/receiv";

const int ON = 1;
const int OFF = 0;
const int timer = 0;

Ultrasonic s1(2, 4);
Ultrasonic s2(5, 18);
Ultrasonic s3(19, 21);

class Painel {
private:
  int pinFree;
  int pinOcupped;
  String status = "ocupped";

public:
  Painel(int a, int b) {
    pinFree = a;
    pinOcupped = b;
    pinMode(pinFree, OUTPUT);
    pinMode(pinOcupped, OUTPUT);
  }

  void setStatus(String a)  // Nome alterado para setStatus (mais semântico)
  {
    status = a;
    if (status == "free") {
      digitalWrite(pinFree, ON);
      digitalWrite(pinOcupped, OFF);
    } else {
      digitalWrite(pinFree, OFF);
      digitalWrite(pinOcupped, ON);
    }
  }

  String currentStatus() {
    return status;
  }
};

// Array de objetos da classe Painel
Painel paneis[3] = {
  Painel(13, 12),
  Painel(14, 27),
  Painel(26, 25)
};

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n WiFi conectado!");
}
void SendDados() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(sendUrl);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    int freeCount = 0;
    int ocuppedCount = 0;
    int total = 3;

    // Contagem dos estados
    for (int i = 0; i < 3; i++) {
      if (paneis[i].currentStatus() == "free") {
        freeCount++;
      } else {
        ocuppedCount++;
      }
    }

    
    JsonObject dataObj = doc["data"].to<JsonObject>();
    dataObj["free"] = freeCount;
    dataObj["ocupped"] = ocuppedCount;
    dataObj["total"] = total;

    String jsonString;
    serializeJson(doc, jsonString);

    
    Serial.print("JSON formatado: ");
    Serial.println(jsonString);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      Serial.printf("Dados enviados! Status: %d\n", httpResponseCode);
    } else {
      Serial.printf("Erro no envio: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  }
}


void loop() {
  // Leitura dos sensores
  int dist[3] = {
    (int)s1.read(),
    (int)s2.read(),
    (int)s3.read()
  };

  for (int i = 0; i < 3; i++) {
    String statusStr = "";

    if (dist[i] > 5 || dist[i] == 0) {
      statusStr = "free";
    } else {
      statusStr = "ocupped";
    }

    paneis[i].setStatus(statusStr);

    Serial.printf("Vaga %d: %d cm - %s\n", i + 1, dist[i], statusStr.c_str());
  }

  SendDados();
  delay(timer);  // Aumentado o delay para não sobrecarregar a API
}