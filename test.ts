// 在 MakeCode 的測試專案內，先完成獨立供電與 I2C 接線，再執行。
// 初次測試請讓車輪懸空，Servo 確認電源有足夠供電能力。

// 當啟動時可選擇設定每顆 Servo 的 RAM 校正：
// carboard.ServoCalibrate(carboard.Servo.S1, 1050, 1500, 1950)

input.onButtonPressed(Button.A, function () {
    carboard.MotorCtrl(carboard.Motor.M1, 50);
    basic.pause(3000);  // 背景 Heartbeat 每 500ms，馬達不應在第 2 秒停止。
    carboard.MotorStop(carboard.Motor.M1, carboard.StopMode.COAST);
});

input.onButtonPressed(Button.B, function () {
    if (carboard.IsConnected()) {
        basic.showIcon(IconNames.Yes);
        carboard.ServoCtrl(carboard.Servo.S1, 90);
    } else {
        basic.showIcon(IconNames.No);
    }
});

input.onButtonPressed(Button.AB, function () {
    carboard.MotorStopAll(carboard.StopMode.BRAKE);
    carboard.ServoStopAll();
});
