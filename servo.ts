// Layer 3：Servo 控制／RAM 中三點校正。
namespace carboard {
    const SERVO_MIN_US = 1000;
    const SERVO_MID_US = 1500;
    const SERVO_MAX_US = 2000;

    // 不使用非揮發性儲存。micro:bit 重新啟動後恢復未校正狀態。
    let calibrated: boolean[] = [false, false, false, false, false, false, false, false];
    let point0: number[] = [SERVO_MIN_US, SERVO_MIN_US, SERVO_MIN_US, SERVO_MIN_US,
        SERVO_MIN_US, SERVO_MIN_US, SERVO_MIN_US, SERVO_MIN_US];
    let point90: number[] = [SERVO_MID_US, SERVO_MID_US, SERVO_MID_US, SERVO_MID_US,
        SERVO_MID_US, SERVO_MID_US, SERVO_MID_US, SERVO_MID_US];
    let point180: number[] = [SERVO_MAX_US, SERVO_MAX_US, SERVO_MAX_US, SERVO_MAX_US,
        SERVO_MAX_US, SERVO_MAX_US, SERVO_MAX_US, SERVO_MAX_US];

    /**
     * 可選 Servo 初始化：指定 0°、90°、180° 對應脈寬 (us)。
     * 請放在「當啟動時」先執行；只保存於本次程式執行的 RAM。
     * 三點必須落在 1000..2000us，且嚴格遞增。
     */
    //% blockId=carboard_servo_calibrate block="初始化校正伺服 $servo |0°=$us0 μs |90°=$us90 μs |180°=$us180 μs"
    //% weight=60 group="伺服" advanced=true
    //% us0.min=1000 us0.max=2000 us0.defl=1000
    //% us90.min=1000 us90.max=2000 us90.defl=1500
    //% us180.min=1000 us180.max=2000 us180.defl=2000
    export function ServoCalibrate(servo: Servo, us0: number, us90: number, us180: number): void {
        if (!carboardProtocol.validServo(servo)) return;
        if (isNaN(us0) || isNaN(us90) || isNaN(us180)) return;
        let low = Math.round(us0);
        let mid = Math.round(us90);
        let high = Math.round(us180);
        if (low < SERVO_MIN_US || high > SERVO_MAX_US) return;
        if (!(low < mid && mid < high)) return;

        let index = servo - 1;
        point0[index] = low;
        point90[index] = mid;
        point180[index] = high;
        calibrated[index] = true;
    }

    /**
     * 指定伺服轉動到 0..180 度。
     * 未校正：使用 STC 的角度指令；已校正：分段換算成脈寬指令。
     */
    //% blockId=carboard_servo_ctrl block="伺服 $servo 角度 $angle °"
    //% weight=100 group="伺服"
    //% angle.min=0 angle.max=180 angle.defl=90
    export function ServoCtrl(servo: Servo, angle: number): void {
        if (!carboardProtocol.validServo(servo)) return;
        if (isNaN(angle)) return;
        let value = Math.round(angle);
        if (value < 0) value = 0;
        if (value > 180) value = 180;

        let index = servo - 1;
        if (!calibrated[index]) {
            carboardProtocol.sendServoAngle(servo, value);
            return;
        }

        let pulseUs = 0;
        if (value <= 90) {
            pulseUs = point0[index] +
                Math.round((point90[index] - point0[index]) * value / 90);
        } else {
            pulseUs = point90[index] +
                Math.round((point180[index] - point90[index]) * (value - 90) / 90);
        }
        carboardProtocol.sendServoPulse(servo, pulseUs);
    }

    /** 直接指定 Servo 脈寬；不使用角度校正表。 */
    //% blockId=carboard_servo_pulse block="伺服 $servo 脈寬 $pulseUs μs"
    //% weight=70 group="伺服" advanced=true
    //% pulseUs.min=1000 pulseUs.max=2000 pulseUs.defl=1500
    export function ServoPulse(servo: Servo, pulseUs: number): void {
        if (!carboardProtocol.validServo(servo) || isNaN(pulseUs)) return;
        let value = Math.round(pulseUs);
        if (value < SERVO_MIN_US || value > SERVO_MAX_US) return;
        carboardProtocol.sendServoPulse(servo, value);
    }

    /**
     * 啟用／停用一顆 Servo 的 PWM。
     * 先讀取 STC 當前的 8-bit Servo 遮罩，再只改指定的那一 bit。
     * 若連線／狀態讀取失敗，不送可能影響其他伺服的遮罩。
     */
    //% blockId=carboard_servo_enable block="伺服 $servo 輸出啟用 $enabled"
    //% weight=80 group="伺服"
    export function ServoEnable(servo: Servo, enabled: boolean): void {
        if (!carboardProtocol.validServo(servo)) return;
        // 避免上一筆剛送出的寫入指令還在 STC 主迴圈等待執行。
        basic.pause(5);
        let status = carboardProtocol.readStatus();
        if (!status) return;
        let oldMask = status[7];
        let bit = 1 << (servo - 1);
        let nextMask = enabled ? (oldMask | bit) : (oldMask & ~bit);
        carboardProtocol.sendServoMask(nextMask);
    }

    /** 停止所有 Servo PWM；不會停止 DC Motor。 */
    //% blockId=carboard_servo_stop_all block="停止全部伺服輸出"
    //% weight=75 group="伺服"
    export function ServoStopAll(): void {
        carboardProtocol.sendServoMask(0);
    }
}
