const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JejakKirim", function () {
  let c, admin, pengirim, gudang, kurir, penerima, lain;
  const ID = "PKT-001";
  const ZERO = ethers.ZeroHash;

  beforeEach(async function () {
    [admin, pengirim, gudang, kurir, penerima, lain] = await ethers.getSigners();
    c = await ethers.deployContract("JejakKirim");
    await c.assignRole(pengirim.address, 2);
    await c.assignRole(gudang.address, 3);
    await c.assignRole(kurir.address, 4);
  });

  async function buat() {
    await c.connect(pengirim).createShipment(ID, "Paket uji", penerima.address);
  }

  it("alur sukses dari Created sampai Confirmed", async function () {
    await buat();
    await c.connect(gudang).receiveAtWarehouse(ID, ZERO);
    await c.connect(kurir).startDelivery(ID);
    await c.connect(kurir).markDelivered(ID, ZERO);
    await c.connect(penerima).confirmReceived(ID);

    const s = await c.getShipment(ID);
    expect(s.status).to.equal(5n);

    const h = await c.getHistory(ID);
    expect(h.length).to.equal(5);
    expect(h[0].status).to.equal(1n);
    expect(h[4].status).to.equal(5n);
  });

  it("menolak akun tanpa peran membuat pengiriman", async function () {
    await expect(
      c.connect(lain).createShipment(ID, "x", penerima.address)
    ).to.be.revertedWith("Peran tidak berwenang untuk aksi ini");
  });

  it("menolak kurir memulai kirim sebelum gudang menerima", async function () {
    await buat();
    await expect(c.connect(kurir).startDelivery(ID)).to.be.revertedWith(
      "Status belum sesuai urutan"
    );
  });

  it("menolak konfirmasi oleh penerima yang salah", async function () {
    await buat();
    await expect(c.connect(lain).confirmReceived(ID)).to.be.revertedWith(
      "Hanya penerima yang ditunjuk"
    );
  });

  it("menolak ID pengiriman ganda", async function () {
    await buat();
    await expect(
      c.connect(pengirim).createShipment(ID, "lagi", penerima.address)
    ).to.be.revertedWith("ID pengiriman sudah dipakai");
  });

  it("menolak konfirmasi sebelum status Delivered", async function () {
    await buat();
    await expect(c.connect(penerima).confirmReceived(ID)).to.be.revertedWith(
      "Status belum sesuai urutan"
    );
  });

  it("memancarkan event StatusUpdated dan mencatat daftar ID", async function () {
    await expect(
      c.connect(pengirim).createShipment(ID, "Paket uji", penerima.address)
    ).to.emit(c, "StatusUpdated");

    const ids = await c.getShipmentIds();
    expect(ids.length).to.equal(1);
    expect(ids[0]).to.equal(ID);
  });
});
