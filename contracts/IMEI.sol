// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract IMEI {
    struct LostDevice {
        string imei;
        address reporter;
        uint256 timestamp;
    }

    mapping(string => LostDevice) private lostDevices;
    string[] private reportedImeis;

    event DeviceReported(string imei, address indexed reporter, uint256 timestamp);
    event DeviceDelisted(string imei, address indexed reporter, uint256 timestamp);

    function reportLostDevice(string memory _imei) public {
        require(isValidIMEI(_imei), "Invalid IMEI number");
        require(!deviceExists(_imei), "IMEI already reported");

        uint256 currentTimestamp = block.timestamp;
        lostDevices[_imei] = LostDevice(_imei, msg.sender, currentTimestamp);
        reportedImeis.push(_imei);
        emit DeviceReported(_imei, msg.sender, currentTimestamp);
    }

    function getLostDevice(string memory _imei) public view returns (string memory, address, uint256) {
        require(deviceExists(_imei), "IMEI not reported");
        LostDevice memory device = lostDevices[_imei];
        return (device.imei, device.reporter, device.timestamp);
    }

    function deviceExists(string memory _imei) public view returns (bool) {
        return bytes(lostDevices[_imei].imei).length > 0;
    }
    function delistDevice(string memory _imei) public {
    require(deviceExists(_imei), "Device with this IMEI does not exist.");
    emit DeviceDelisted(_imei, msg.sender, block.timestamp);
}

    function getTotalReportedDevices() public view returns (uint256) {
        return reportedImeis.length;
    }

    function getReportedImeis() public view returns (string[] memory) {
        return reportedImeis;
    }
    function isValidIMEI(string memory _imei) internal pure returns (bool) {
    bytes memory imeiBytes = bytes(_imei);
    
    // Check length
    if (imeiBytes.length != 15) {
        return false;
    }
    
    // Check Luhn algorithm
    uint256 sum = 0;
    for (uint256 i = 0; i < 15; i++) {
        uint256 digit = uint256(uint8(imeiBytes[i])) - 48; // Convert ASCII to digit
        if (i % 2 == 1) {
            digit *= 2;
            if (digit > 9) {
                digit = (digit % 10) + 1; // Same as adding the digits of the product
            }
        }
        sum += digit;
    }
    return sum % 10 == 0;
}
