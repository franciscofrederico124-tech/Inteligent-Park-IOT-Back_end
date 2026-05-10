async function ultrassonicData(req, res, parkingData, broadcastSummary) {
  try {
    const { vagas } = req.body; // ESP32 envia { "vagas": { ... } }

    if (!vagas) {
      console.log("Dados não recebidos");
      return res.status(400).json({ message: "Dados não recebidos" });
    }

    console.log("Dados recebidos:", vagas);

    // Atualiza o objeto original
    Object.assign(parkingData, vagas);

    // Envia atualização para clientes WebSocket
    broadcastSummary();

    return res.status(200).json({ message: "Dados recebidos com sucesso" });

  } catch (error) {
    console.error("Erro ao processar os dados:", error.message);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}

module.exports = ultrassonicData;
