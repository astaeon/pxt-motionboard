// Layer 1：I2C 傳輸。保持與裝置功能及協定命令無關。
namespace carboardI2C {
    const I2C_ADDR = 0x30; // STC 7-bit slave address

    export function writeFrame(data: number[]): void {
        let frame = pins.createBuffer(data.length);
        for (let i = 0; i < data.length; i++) {
            frame[i] = data[i] & 0xFF;
        }
        // STC 的命令只在 STOP 完成後提交；不要使用 repeated START。
        pins.i2cWriteBuffer(I2C_ADDR, frame, false);
    }

    export function readFrame(length: number): Buffer {
        return pins.i2cReadBuffer(I2C_ADDR, length, false);
    }
}
