const express = require('express');
const axios = require('axios');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;

let newData = null; // Variable global para almacenar los datos procesados
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint para actualizar y obtener datos
app.get('/datos', async (req, res) => {
  try {
    // Obtén el archivo Excel desde un enlace constante
    const excelURL = 'https://docs.google.com/spreadsheets/d/1yV6xv86tLCfhyhHJTfLE7yQw5e9ZF-5I/edit?usp=sharing&ouid=115306436663344694367&rtpof=true&sd=true';
    const response = await axios.get(excelURL, { responseType: 'arraybuffer' });
    const excelData = response.data;

    // Procesa el archivo Excel
    const workbook = XLSX.read(excelData, { type: 'array' });

    // Supongamos que el archivo Excel tiene una sola hoja
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convierte los datos de la hoja de Excel a un objeto JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    jsonData.shift();
    newData = jsonData.map(subarray => subarray.slice(1));

    // Desactivar la caché en la respuesta
    res.setHeader('Cache-Control', 'no-store');
    
    // Enviar una respuesta exitosa
    return res.json({ success: true, message: 'Datos procesados con éxito', data: newData });
  } catch (error) {
    console.error('Error al obtener y procesar el archivo Excel:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener y procesar el archivo Excel' });
  }
});

app.listen(port, () => {
  console.log("Servidor escuchando en el puerto", port);
});
