export function MpsSocialCard() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
        background: "linear-gradient(125deg, #07553e 0%, #087650 64%, #c5d59a 100%)",
        color: "#fffefa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 10,
          height: 480,
          position: "absolute",
          right: 160,
          top: 72,
          transform: "rotate(36deg)",
          border: "1px solid #ffffff24",
        }}
      />
      <div
        style={{
          display: "flex",
          width: 350,
          height: 350,
          position: "absolute",
          right: 80,
          top: 145,
          borderRadius: 200,
          background: "radial-gradient(circle, #f3ed9c 0%, #e9dc53 48%, #e9dc5300 70%)",
        }}
      />
      <div
        style={{
          display: "flex",
          width: 1050,
          height: 500,
          position: "absolute",
          right: -340,
          bottom: -370,
          transform: "rotate(-20deg)",
          border: "1px solid #ffffff31",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          marginLeft: 94,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 64,
          }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 27, letterSpacing: 1 }}>MPS Adyaveda</span>
              <span style={{ color: "#f5f2c6", fontSize: 15 }}>
                MAJELIS PERMUSYAWARATAN SISWA
              </span>
            </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Georgia, serif",
            fontSize: 68,
            letterSpacing: -2,
            lineHeight: 1.14,
          }}
        >
          <span>Situs publik</span>
          <span style={{ color: "#f0e56c" }}>MPS Adyaveda</span>
        </div>
        <span style={{ marginTop: 26, color: "#f5f2c6", fontSize: 18 }}>
          Informasi organisasi
        </span>
      </div>
      <span
        style={{
          display: "flex",
          position: "absolute",
          right: 56,
          bottom: 44,
          color: "#ffffffa6",
          fontSize: 12,
          letterSpacing: 2,
        }}
      >
        MPS ADYAVEDA
      </span>
    </div>
  );
}
