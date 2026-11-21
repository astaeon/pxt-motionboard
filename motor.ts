// Layer 3：DC Motor 控制與自動保活。
namespace carboard {
    const HEARTBEAT_INTERVAL_MS = 500;
    // STC 的固定 Timeout 由 STC 韌體負責：2000ms。
    // 不提供設定 Heartbeat 或 Timeout 的公開 API。

    let activeMotorMask = 0;
    let heartbeatWorkerStarted = false;

    function ensureHeartbeatWorker(): void {
        if (heartbeatWorkerStarted) return;
        heartbeatWorkerStarted = true;
        control.inBackground(function () {
            while (true) {
                basic.pause(HEARTBEAT_INTERVAL_MS);
                // 只保活本 Extension 曾啟動且尚未停止的馬達。
                if (activeMotorMask != 0) {
                    carboardProtocol.heartbeat();
                }
            }
        });
    }

    /**
     * 控制單顆馬達。正數正轉，負數反轉；0 為滑行停止。
     * speed 是 PWM 百分比，不是實際 RPM。
     */
    //% blockId=carboard_motor_ctrl block="馬達 $motor 速度 $speed %"
    //% weight=100 group="馬達"
    //% speed.min=-100 speed.max=100 speed.defl=50
    export function MotorCtrl(motor: Motor, speed: number): void {
        if (!carboardProtocol.validMotor(motor)) return;
        if (isNaN(speed)) return;
        let speedValue = Math.round(speed);
        if (speedValue < -100) speedValue = -100;
        if (speedValue > 100) speedValue = 100;

        let bit = 1 << (motor - 1);
        // 先更新本機保活狀態；STOP/COAST 時即使寫入失敗，
        // STC 仍會因缺少 Heartbeat 而在固定逾時後滑行停止。
        if (speedValue == 0) activeMotorMask &= ~bit;
        else activeMotorMask |= bit;

        carboardProtocol.sendMotor(motor, speedValue);
        if (speedValue != 0) ensureHeartbeatWorker();
    }

    /** 指定馬達滑行停止或電氣煞車。 */
    //% blockId=carboard_motor_stop block="停止馬達 $motor 模式 $mode"
    //% weight=90 group="馬達"
    export function MotorStop(motor: Motor, mode: StopMode): void {
        if (!carboardProtocol.validMotor(motor)) return;
        if (mode != StopMode.COAST && mode != StopMode.BRAKE) return;
        let bit = 1 << (motor - 1);
        activeMotorMask &= ~bit;
        carboardProtocol.stopMotorMask(bit, mode);
    }

    /** 將全部四顆 DC 馬達停止，Servo 維持原輸出。 */
    //% blockId=carboard_motor_stop_all block="停止全部馬達 模式 $mode"
    //% weight=85 group="馬達"
    export function MotorStopAll(mode: StopMode): void {
        if (mode != StopMode.COAST && mode != StopMode.BRAKE) return;
        activeMotorMask = 0;
        carboardProtocol.stopMotorMask(0x0F, mode);
    }
}
