const express = require('express');
const axios = require('axios');
const XLSX = require('xlsx');

const app = express();
const port = 3000;

let newData = null; // Variable global para almacenar los datos procesados

// Endpoint para descargar y procesar el archivo Excel desde un enlace constante
app.get('/actualizar-datos', async (req, res) => {
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

    // Devuelve los datos en formato JSON como respuesta
    res.json(jsonData);
  } catch (error) {
    console.error('Error al obtener y procesar el archivo Excel:', error);
    res.status(500).json({ error: 'Error al obtener y procesar el archivo Excel' });
  }
});

// Endpoint para obtener los datos procesados en otro lugar de tu aplicación
app.get('/obtener-datos', (req, res) => {
  if (newData) {
    res.json(newData);
  } else {
    res.status(404).json({ error: 'Los datos aún no se han procesado' });
  }
});

app.listen(process.env.PORT || port, () => {
  console.log("Servidor escuchando en el puerto", process.env.PORT || port  );
});
