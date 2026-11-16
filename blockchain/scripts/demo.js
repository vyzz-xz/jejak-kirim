const hre = require("hardhat");
const path = require("path");

const { address } = require(path.join(
  __dirname, "..", "..", "frontend", "src", "contracts", "address.json"
));

const LABEL = ["-", "Dibuat", "Di Gudang", "Dalam Perjalanan", "Tiba di Tujuan", "Diterima"];

async function main() {
  const [admin, pengirim, gudang, kurir, penerima] = await hre.ethers.getSigners();
  const c = await hre.ethers.getContractAt("JejakKirim", address);
  const Z = hre.ethers.ZeroHash;
  const id = "DEMO-" + Date.now();

  const langkah = async (nama, tx) => {
    const r = await (await tx).wait();
    console.log(nama.padEnd(28), "hash:", r.hash);
  };

  await langkah("Pengirim membuat", c.connect(pengirim).createShipment(id, "Paket demo", penerima.address));
  await langkah("Gudang menerima", c.connect(gudang).receiveAtWarehouse(id, Z));
  await langkah("Kurir mulai kirim", c.connect(kurir).startDelivery(id));
  await langkah("Kurir tandai terkirim", c.connect(kurir).markDelivered(id, Z));
  await langkah("Penerima konfirmasi", c.connect(penerima).confirmReceived(id));

  console.log("\nRiwayat", id);
  const h = await c.getHistory(id);
  h.forEach((e, i) => {
    console.log(`${i + 1}. ${LABEL[Number(e.status)]} | ${new Date(Number(e.timestamp) * 1000).toLocaleString("id-ID")} | ${e.actor}`);
  });

  // Contoh aksi yang sengaja ditolak
  try {
    await c.connect(kurir).startDelivery(id);
  } catch (e) {
    console.log("\nAksi salah ditolak:", e.shortMessage || e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
