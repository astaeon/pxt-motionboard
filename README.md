# micro:bit 小車控制板 — MakeCode Extension v1.0

這是可放到獨立 GitHub Repository、供 micro:bit MakeCode 匯入的 Extension 原始碼（不是編譯後 .hex）。

## 固定安全參數

- I2C 7-bit 位址：`0x30`（micro:bit P19=SCL / P20=SDA；STC P3.2=SCL / P3.3=SDA）。
- 自動 Heartbeat：**500 ms**。僅當本 Extension 記錄有 Motor 運轉時，透過背景 Fiber 發送 `0x20`。
- STC Motor Timeout：**2000 ms**。原始 STC 韌體雖預設 2000 ms，仍支援 `0x21` 修改；如需真正固定，請另外套用隨附 `STC_TIMEOUT_FIXED_2000MS.patch` 並重新編譯燒錄。
- 不公開 Heartbeat / Timeout 設定函數；不提供全裝置 StopAll 或 MotorCtrlAll。
- 重要：背景 Fiber 活著時，即使使用者主程式卡住，也可能繼續發送 Heartbeat；這不等於 MCU 硬體 Watchdog。

## 公開函數（namespace `carboard`）

| API | 功能 |
| --- | --- |
| `MotorCtrl(Motor.M1, 50)` | -100～100 PWM；0 為 COAST |
| `MotorStop(Motor.M1, StopMode.COAST)` | 單顆滑行／煞車 |
| `MotorStopAll(StopMode.BRAKE)` | 停止全部四顆馬達 |
| `ServoCtrl(Servo.S1, 90)` | 未校正：使用 STC 角度命令；校正後用脈寬命令 |
| `ServoCalibrate(Servo.S1, 1100, 1500, 1950)` | 可選 0/90/180 度三點校正，僅 RAM 保存 |
| `ServoPulse(Servo.S1, 1500)` | 直接指定 1000～2000 us |
| `ServoEnable(Servo.S1, true)` | 開／關單顆 Servo PWM，不改變其他 Servo 的遮罩 |
| `ServoStopAll()` | 關閉全部 Servo PWM |
| `IsConnected()` | 讀取 8 Byte STC 狀態，檢查 magic/version/initialized |

Enum 成員全大寫：`Motor.M1`..`M4`、`Servo.S1`..`S8`、`StopMode.COAST` / `BRAKE`。

## Servo 校正的使用方式

在「當啟動時」先呼叫 `ServoCalibrate()`（可選），再使用 `ServoCtrl()`。

- 未設定校正時：0°=1000us、90°=1500us、180°=2000us，由 STC 處理角度換算。
- 設定三點校正後：micro:bit 在 0..90 與 90..180 度各自線性插值，透過 `0x02` 送到 STC。
- 只保存在 micro:bit 本次程式執行期間的 RAM；重新開機需要再次執行初始化。
- 三點脈寬必須落在 1000..2000us，且 us0 < us90 < us180，否則忽略該次校正。
- 在目前 STC 韌體的限制以外的脈寬，不會送出；控制精度是 PWM 指令的脈寬，不代表有角度回授。

## 使用方法

1. 將此目錄內 `pxt.json` 和各 `.ts`、`README.md` 上傳到**獨立的新 GitHub Extension Repository 根目錄**。
2. 開啟 https://makecode.microbit.org → 新專案 → 擴充功能 → 貼上該 Repo 的 GitHub URL。
3. 出現「小車控制板」類別後，即可直接使用積木或 JavaScript/TypeScript 函數。
4. `test.ts` 是開發者測試用程式，可在 MakeCode 測試專案使用；不會作為 Extension 一般原始碼一起編入。

## 韌體協定基準

STC 協定 v1.0，Servo 指令 `01/02/04`，Motor 指令 `10/12`，Heartbeat `20`，狀態回讀 `A5 01 ...` 共 8 Bytes。

## Layer 與檔案

- L4 積木應用：`//% block` 註解直接附在 L3 公開函數上，不額外重寫函數。
- L3 裝置控制：`motor.ts`、`servo.ts`、`status.ts`。
- L2 STC 協定：`protocol.ts`。
- L1 I2C：`i2c.ts`。
- L0 STC 韌體：另外由 STC 原始碼維護。

## 限制與驗證

- 第一版未經真實 micro:bit + 正式 PCB 的整體測試；MakeCode PXT 雲端編譯也尚未實際執行。
- `MotorCtrl` 速度為 PWM Duty 百分比，不是實際 RPM。
- `ServoEnable()` 先向 STC 讀取 8 Byte 狀態，避免關閉其他 Servo；狀態失效時不送遮罩。
- micro:bit 發送的 I2C 命令若沒成功，不會被 STC 的主控程式以另一個 ACK 確認；需要依實機測試。
- STC 接收到命令，直到主迴圈處理完成可能有短暫延遲；`IsConnected()` 只是連線狀態辨識。
