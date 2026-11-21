/**
 * 小車擴充板控制：直接透過 I2C 控制板上的 DC Motor 和 Servo。
 */
//% color="#2583b8" weight=95 icon="\uf1b9" block="小車控制板"
namespace carboard {
    /** DC 馬達的實體通道。 */
    export enum Motor {
        //% block="M1"
        M1 = 1,
        //% block="M2"
        M2 = 2,
        //% block="M3"
        M3 = 3,
        //% block="M4"
        M4 = 4
    }

    /** 伺服馬達的實體通道。 */
    export enum Servo {
        //% block="S1"
        S1 = 1,
        //% block="S2"
        S2 = 2,
        //% block="S3"
        S3 = 3,
        //% block="S4"
        S4 = 4,
        //% block="S5"
        S5 = 5,
        //% block="S6"
        S6 = 6,
        //% block="S7"
        S7 = 7,
        //% block="S8"
        S8 = 8
    }

    /** DC Motor 停止方式：COAST 滑行，BRAKE 電氣煞車。 */
    export enum StopMode {
        //% block="滑行 COAST"
        COAST = 0,
        //% block="煞車 BRAKE"
        BRAKE = 1
    }
}
