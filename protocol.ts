// Layer 2：STC I2C Protocol v1.0。內部使用，不建立積木。
namespace carboardProtocol {
    const CMD_SERVO_ANGLE = 0x01;
    const CMD_SERVO_PULSE = 0x02;
    const CMD_SERVO_MASK = 0x04;
    const CMD_MOTOR = 0x10;
    const CMD_MOTOR_STOP = 0x12;
    const CMD_HEARTBEAT = 0x20;

    const STATUS_BYTES = 8;
    const STATUS_MAGIC = 0xA5;
    const PROTOCOL_VERSION = 0x01;

    export function validMotor(motor: number): boolean {
        return motor >= 1 && motor <= 4 && motor == Math.round(motor);
    }

    export function validServo(servo: number): boolean {
        return servo >= 1 && servo <= 8 && servo == Math.round(servo);
    }

    export function sendMotor(motor: number, speed: number): void {
        // 8-bit 二補數：例如 -50 -> 206 (0xCE)。
        carboardI2C.writeFrame([CMD_MOTOR, motor, speed & 0xFF]);
    }

    export function stopMotorMask(mask: number, mode: number): void {
        carboardI2C.writeFrame([CMD_MOTOR_STOP, mask & 0x0F, mode & 0x01]);
    }

    export function sendServoAngle(servo: number, angle: number): void {
        carboardI2C.writeFrame([CMD_SERVO_ANGLE, servo, angle]);
    }

    export function sendServoPulse(servo: number, pulseUs: number): void {
        // 16-bit 小端格式。
        carboardI2C.writeFrame([CMD_SERVO_PULSE, servo,
            pulseUs & 0xFF, (pulseUs >> 8) & 0xFF]);
    }

    export function sendServoMask(mask: number): void {
        carboardI2C.writeFrame([CMD_SERVO_MASK, mask & 0xFF]);
    }

    export function heartbeat(): void {
        carboardI2C.writeFrame([CMD_HEARTBEAT]);
    }

    export function readStatus(): Buffer {
        let status = carboardI2C.readFrame(STATUS_BYTES);
        if (status.length != STATUS_BYTES) return null;
        if (status[0] != STATUS_MAGIC) return null;
        if (status[1] != PROTOCOL_VERSION) return null;
        if ((status[3] & 0x08) == 0) return null; // initialized flag
        return status;
    }
}
