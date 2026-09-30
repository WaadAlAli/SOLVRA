import 'dotenv/config'

import app from './app.js'

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`SOLVRA API listening on port ${PORT}`)
})
