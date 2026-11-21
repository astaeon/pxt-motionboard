// Layer 3：狀態 API。
namespace carboard {
    /** 讀取 STC 的 8 Byte 狀態並確認初始化與協定版本。 */
    //% blockId=carboard_is_connected block="STC 是否連線"
    //% weight=80 group="狀態"
    export function IsConnected(): boolean {
        return carboardProtocol.readStatus() != null;
    }
}
