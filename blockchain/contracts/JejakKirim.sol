// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title JejakKirim
/// @notice Mencatat perjalanan paket dari pengirim sampai penerima.
contract JejakKirim {
    // Peran global. Penerima tidak punya peran global, ia ditunjuk per pengiriman.
    enum Role { None, Admin, Pengirim, Gudang, Kurir }

    // Urutan status harus sama dengan frontend (0 = belum ada).
    enum Status { None, Created, AtWarehouse, InTransit, Delivered, Confirmed }

    struct Shipment {
        string id;
        string deskripsi;
        address pengirim;
        address penerima;
        Status status;
    }

    struct HistoryEntry {
        Status status;
        uint256 timestamp; // dalam detik
        address actor;
        bytes32 evidenceHash; // hash bukti, boleh kosong
    }

    mapping(address => Role) public roles;
    mapping(string => Shipment) private shipments;
    mapping(string => HistoryEntry[]) private histories;
    string[] private shipmentIds;

    event RoleAssigned(address indexed account, Role role);
    event StatusUpdated(
        string id,
        Status status,
        address indexed actor,
        uint256 timestamp,
        bytes32 evidenceHash
    );

    // Membatasi fungsi hanya untuk akun dengan peran tertentu.
    modifier onlyRole(Role role) {
        require(roles[msg.sender] == role, "Peran tidak berwenang untuk aksi ini");
        _;
    }

    // Akun yang mendeploy contract otomatis menjadi Admin.
    constructor() {
        roles[msg.sender] = Role.Admin;
        emit RoleAssigned(msg.sender, Role.Admin);
    }

    function assignRole(address account, Role role) external onlyRole(Role.Admin) {
        require(account != address(0), "Alamat tidak valid");
        roles[account] = role;
        emit RoleAssigned(account, role);
    }

    function createShipment(
        string calldata id,
        string calldata deskripsi,
        address penerima
    ) external onlyRole(Role.Pengirim) {
        require(bytes(id).length > 0, "ID wajib diisi");
        require(penerima != address(0), "Penerima tidak valid");
        require(shipments[id].status == Status.None, "ID pengiriman sudah dipakai");

        shipments[id] = Shipment(id, deskripsi, msg.sender, penerima, Status.Created);
        shipmentIds.push(id);
        _catat(id, Status.Created, bytes32(0));
    }

    function receiveAtWarehouse(string calldata id, bytes32 evidenceHash)
        external
        onlyRole(Role.Gudang)
    {
        _pindah(id, Status.Created, Status.AtWarehouse, evidenceHash);
    }

    function startDelivery(string calldata id) external onlyRole(Role.Kurir) {
        _pindah(id, Status.AtWarehouse, Status.InTransit, bytes32(0));
    }

    function markDelivered(string calldata id, bytes32 evidenceHash)
        external
        onlyRole(Role.Kurir)
    {
        _pindah(id, Status.InTransit, Status.Delivered, evidenceHash);
    }

    // Hanya penerima yang ditunjuk pada pengiriman tersebut yang boleh konfirmasi.
    function confirmReceived(string calldata id) external {
        Shipment storage s = _ambil(id);
        require(msg.sender == s.penerima, "Hanya penerima yang ditunjuk");
        require(s.status == Status.Delivered, "Status belum sesuai urutan");
        s.status = Status.Confirmed;
        _catat(id, Status.Confirmed, bytes32(0));
    }

    // ---- Fungsi baca ----

    function getShipment(string calldata id) external view returns (Shipment memory) {
        return _ambil(id);
    }

    function getHistory(string calldata id) external view returns (HistoryEntry[] memory) {
        _ambil(id); // memastikan pengiriman ada
        return histories[id];
    }

    function getShipmentIds() external view returns (string[] memory) {
        return shipmentIds;
    }

    // ---- Fungsi internal ----

    function _ambil(string memory id) internal view returns (Shipment storage s) {
        s = shipments[id];
        require(s.status != Status.None, "Pengiriman tidak ditemukan");
    }

    // State machine: status hanya boleh berpindah dari "dari" ke "ke".
    function _pindah(string memory id, Status dari, Status ke, bytes32 bukti) internal {
        Shipment storage s = _ambil(id);
        require(s.status == dari, "Status belum sesuai urutan");
        s.status = ke;
        _catat(id, ke, bukti);
    }

    function _catat(string memory id, Status status, bytes32 bukti) internal {
        histories[id].push(HistoryEntry(status, block.timestamp, msg.sender, bukti));
        emit StatusUpdated(id, status, msg.sender, block.timestamp, bukti);
    }
}
