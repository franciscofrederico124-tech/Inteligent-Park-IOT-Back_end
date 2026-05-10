const db = require("../config/sqlite3");

async function Register(req, res) {
  const { name, email, password } = req.body;

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  // Regex simples para email e senha
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{6,}$/; // mínimo 6 caracteres



  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email inválido" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: "Senha deve ter pelo menos 6 caracteres" });
  }

  try {
    db.get(`SELECT * FROM users WHERE password = ? AND email = ?`, [password, email], (err, row) => {
      if (err) {
        console.log(err.message)
      }
      if (row) {
        return res.status(500).json({ message: "Dados inválidos!" });
      } else {
        db.run(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, password],
          function (err) {
            if (err) {
              console.error("Erro ao inserir usuário:", err.message);
              return res.status(500).json({ message: "Erro interno do servidor" });
            }
            return res.status(201).json({
              message: "Conta criada com sucesso!",
              userId: this.lastID,
            });
          }
        );
      }
    });



  } catch (error) {
    console.error("Erro ao processar cadastro:", error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = Register 