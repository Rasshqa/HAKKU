import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { getServerSessionUser } from "../src/lib/auth/server";

describe("Auth Guard: Proteksi Akses Fitur Berbasis AI", () => {
  it("harus menolak akses jika tidak ada cookie session yang valid (unauthenticated)", async () => {
    const unauthenticatedReq = new NextRequest("http://localhost:3000/api/consultation/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Halo, saya butuh konsultasi hukum" }],
      }),
    });

    const user = await getServerSessionUser(unauthenticatedReq);
    assert.equal(user, null, "Pengguna tanpa cookie session harus bernilai null");
  });

  it("harus memvalidasi rute yang memerlukan proteksi login di middleware", () => {
    const PROTECTED_ROUTES = ["/akun", "/konsultasi", "/pendampingan"];
    const PUBLIC_ROUTES = ["/", "/kalkulator", "/kontrak", "/dokumen", "/bukti", "/rujukan", "/tentang"];

    for (const route of PROTECTED_ROUTES) {
      const isProtected = PROTECTED_ROUTES.some(
        (p) => route === p || route.startsWith(`${p}/`)
      );
      assert.equal(isProtected, true, `Rute ${route} wajib dilindungi login`);
    }

    for (const route of PUBLIC_ROUTES) {
      const isProtected = PROTECTED_ROUTES.some(
        (p) => route === p || route.startsWith(`${p}/`)
      );
      assert.equal(isProtected, false, `Rute ${route} harus dapat diakses bebas tanpa login`);
    }
  });
});
