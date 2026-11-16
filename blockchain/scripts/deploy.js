const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Urutan akun demo (harus sama dengan frontend)
  const [admin, pengirim, gudang, kurir, penerima] = await hre.ethers.getSigners();

  const c = await hre.ethers.deployContract("JejakKirim");
  await c.waitForDeployment();
  const address = await c.getAddress();

  // Beri peran ke akun demo (Admin = akun 0 yang mendeploy)
  await (await c.assignRole(pengirim.address, 2)).wait();
  await (await c.assignRole(gudang.address, 3)).wait();
  await (await c.assignRole(kurir.address, 4)).wait();

  // Salin ABI, alamat, dan daftar akun ke frontend
  const artifact = await hre.artifacts.readArtifact("JejakKirim");
  const out = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  fs.mkdirSync(out, { recursive: true });

  fs.writeFileSync(path.join(out, "abi.json"), JSON.stringify(artifact.abi, null, 2));
  fs.writeFileSync(path.join(out, "address.json"), JSON.stringify({ address }, null, 2));
  fs.writeFileSync(
    path.join(out, "accounts.json"),
    JSON.stringify(
      {
        admin: admin.address,
        pengirim: pengirim.address,
        gudang: gudang.address,
        kurir: kurir.address,
        penerima: penerima.address,
      },
      null,
      2
    )
  );

  console.log("Contract aktif di:", address);
  console.log("Admin    :", admin.address);
  console.log("Pengirim :", pengirim.address);
  console.log("Gudang   :", gudang.address);
  console.log("Kurir    :", kurir.address);
  console.log("Penerima :", penerima.address);
  console.log("File koneksi ditulis ke:", out);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
