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
        require(bytes(_imei).length == 15, "Invalid IMEI length");
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
    // Logic to remove IMEI from reported list
    // You might want to emit an event like DeviceDelisted
    emit DeviceDelisted(_imei, msg.sender, block.timestamp);
}

    function getTotalReportedDevices() public view returns (uint256) {
        return reportedImeis.length;
    }

    function getReportedImeis() public view returns (string[] memory) {
        return reportedImeis;
    }
}
