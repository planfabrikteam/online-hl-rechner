import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

// U-Wert Katalog basierend auf suissetec-Dokument
const U_WERTE_KATALOG = {
  'bis 1900': { dach: 0.70, aussenwand: 1.20, fenster: 3.00, boden: 0.80 },
  '1900-1920': { dach: 0.50, aussenwand: 1.10, fenster: 3.00, boden: 1.30 },
  '1920-1960': { dach: 0.80, aussenwand: 1.00, fenster: 2.60, boden: 1.40 },
  '1960-1970': { dach: 0.80, aussenwand: 0.80, fenster: 2.60, boden: 1.30 },
  '1970-1980': { dach: 0.70, aussenwand: 0.70, fenster: 2.80, boden: 0.70 },
  '1980-1990': { dach: 0.40, aussenwand: 0.40, fenster: 1.50, boden: 0.60 },
  '1990-2000': { dach: 0.30, aussenwand: 0.30, fenster: 1.30, boden: 0.35 },
  'ab 2015': { dach: 0.17, aussenwand: 0.17, fenster: 0.90, boden: 0.20 }
};

const BAUJAHR_PERIODEN = Object.keys(U_WERTE_KATALOG);

const RaumFormular = ({ raum, index, onChange, onDelete }) => {
  const [eingabeVariante, setEingabeVariante] = useState('geometrie'); // 'geometrie' oder 'flaechen'

  const handleChange = (field, value) => {
    onChange(index, { ...raum, [field]: value });
  };

  const handleBauteilChange = (bauteil, field, value) => {
    if (field === null) {
      // Für Fenster-Array direkt setzen
      const neueBauteile = { ...raum.bauteile, [bauteil]: value };
      onChange(index, { ...raum, bauteile: neueBauteile });
    } else {
      const neueBauteile = { ...raum.bauteile, [bauteil]: { ...raum.bauteile[bauteil], [field]: value } };
      onChange(index, { ...raum, bauteile: neueBauteile });
    }
  };

  const addFenster = () => {
    const aktFenster = Array.isArray(raum.bauteile.fenster) ? raum.bauteile.fenster : [];
    const neueFenster = [...aktFenster, { anzahl: 1, flaecheProFenster: 1.5 }];
    handleBauteilChange('fenster', null, neueFenster);
  };

  const removeFenster = (fensterIndex) => {
    const aktFenster = Array.isArray(raum.bauteile.fenster) ? raum.bauteile.fenster : [];
    const neueFenster = aktFenster.filter((_, i) => i !== fensterIndex);
    handleBauteilChange('fenster', null, neueFenster);
  };

  const updateFenster = (fensterIndex, field, value) => {
    const aktFenster = Array.isArray(raum.bauteile.fenster) ? raum.bauteile.fenster : [];
    const neueFenster = [...aktFenster];
    neueFenster[fensterIndex] = { ...neueFenster[fensterIndex], [field]: parseFloat(value) || 0 };
    handleBauteilChange('fenster', null, neueFenster);
  };

  // Berechne Flächen aus Geometrie
  const berechneFlaechen = () => {
    if (eingabeVariante === 'geometrie') {
      const { laenge, breite, hoehe } = raum.geometrie;
      return {
        grundflaeche: laenge * breite,
        wandflaeche: 2 * (laenge + breite) * hoehe
      };
    }
    return null;
  };

  const flaechen = berechneFlaechen();

  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Raum {index + 1}: {raum.name || 'Ohne Namen'}
        </h3>
        <button
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-700 p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Raumname */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Raumname</label>
        <input
          type="text"
          value={raum.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="z.B. Wohnzimmer"
        />
      </div>

      {/* Baujahr & Sanierung */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
          <select
            value={raum.baujahr}
            onChange={(e) => handleChange('baujahr', e.target.value)}
            className="w-full p-2 border rounded"
          >
            {BAUJAHR_PERIODEN.map(periode => (
              <option key={periode} value={periode}>{periode}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sanierungsjahr (optional)</label>
          <select
            value={raum.sanierungsjahr}
            onChange={(e) => handleChange('sanierungsjahr', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Nicht saniert</option>
            {BAUJAHR_PERIODEN.map(periode => (
              <option key={periode} value={periode}>{periode}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sanierte Bauteile */}
      {raum.sanierungsjahr && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sanierte Bauteile</label>
          <div className="flex flex-wrap gap-3">
            {['dach', 'aussenwand', 'fenster', 'boden'].map(bauteil => (
              <label key={bauteil} className="flex items-center">
                <input
                  type="checkbox"
                  checked={raum.sanierteBauteile.includes(bauteil)}
                  onChange={(e) => {
                    const neue = e.target.checked
                      ? [...raum.sanierteBauteile, bauteil]
                      : raum.sanierteBauteile.filter(b => b !== bauteil);
                    handleChange('sanierteBauteile', neue);
                  }}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{bauteil}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Eingabevariante */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Eingabemethode</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={eingabeVariante === 'geometrie'}
              onChange={() => setEingabeVariante('geometrie')}
              className="mr-2"
            />
            <span className="text-sm">L × B × H eingeben</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={eingabeVariante === 'flaechen'}
              onChange={() => setEingabeVariante('flaechen')}
              className="mr-2"
            />
            <span className="text-sm">Flächen direkt eingeben</span>
          </label>
        </div>
      </div>

      {/* Geometrie oder Flächen */}
      {eingabeVariante === 'geometrie' ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Raumgeometrie</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Länge (m)</label>
              <input
                type="number"
                step="0.1"
                value={raum.geometrie.laenge}
                onChange={(e) => handleChange('geometrie', { ...raum.geometrie, laenge: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Breite (m)</label>
              <input
                type="number"
                step="0.1"
                value={raum.geometrie.breite}
                onChange={(e) => handleChange('geometrie', { ...raum.geometrie, breite: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Höhe (m)</label>
              <input
                type="number"
                step="0.1"
                value={raum.geometrie.hoehe}
                onChange={(e) => handleChange('geometrie', { ...raum.geometrie, hoehe: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {flaechen && (
            <div className="mt-2 text-sm text-gray-600">
              Grundfläche: {flaechen.grundflaeche.toFixed(2)} m² | 
              Wandfläche (gesamt): {flaechen.wandflaeche.toFixed(2)} m²
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Raumvolumen (m³)</label>
          <input
            type="number"
            step="0.1"
            value={raum.volumen}
            onChange={(e) => handleChange('volumen', parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {/* Bauteile */}
      <div className="space-y-4">
        {/* Außenwände */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Außenwände gegen außen (m²)
          </label>
          <input
            type="number"
            step="0.1"
            value={raum.bauteile.aussenwand.flaecheAussen}
            onChange={(e) => handleBauteilChange('aussenwand', 'flaecheAussen', parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Innenwände */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Innenwände gg. unbeheizt (m²)
            </label>
            <input
              type="number"
              step="0.1"
              value={raum.bauteile.innenwand.flaecheUnbeheizt}
              onChange={(e) => handleBauteilChange('innenwand', 'flaecheUnbeheizt', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Innenwände gg. beheizt (m²)
            </label>
            <input
              type="number"
              step="0.1"
              value={raum.bauteile.innenwand.flaecheBeheizt}
              onChange={(e) => handleBauteilChange('innenwand', 'flaecheBeheizt', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Fenster */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fenster</label>
          {(Array.isArray(raum.bauteile.fenster) ? raum.bauteile.fenster : []).map((fenster, fIdx) => (
            <div key={fIdx} className="flex gap-2 mb-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Anzahl"
                  value={fenster.anzahl}
                  onChange={(e) => updateFenster(fIdx, 'anzahl', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Fläche/Fenster (m²)"
                  value={fenster.flaecheProFenster}
                  onChange={(e) => updateFenster(fIdx, 'flaecheProFenster', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                onClick={() => removeFenster(fIdx)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            onClick={addFenster}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus size={16} /> Fenstertyp hinzufügen
          </button>
        </div>

        {/* Dach */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dachtyp</label>
            <select
              value={raum.bauteile.dach.typ}
              onChange={(e) => handleBauteilChange('dach', 'typ', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="steildach">Steildach</option>
              <option value="flachdach">Flachdach</option>
              <option value="estrichboden">Estrichboden</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dachfläche (m²)</label>
            <input
              type="number"
              step="0.1"
              value={raum.bauteile.dach.flaeche}
              onChange={(e) => handleBauteilChange('dach', 'flaeche', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Boden */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boden gegen</label>
            <select
              value={raum.bauteile.boden.typ}
              onChange={(e) => handleBauteilChange('boden', 'typ', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="beheizt">Beheizt</option>
              <option value="unbeheizt">Unbeheizt</option>
              <option value="aussen">Außen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bodenfläche (m²)</label>
            <input
              type="number"
              step="0.1"
              value={raum.bauteile.boden.flaeche}
              onChange={(e) => handleBauteilChange('boden', 'flaeche', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const HeizlastRechner = () => {
  const [raeume, setRaeume] = useState([]);
  const [temperaturInnen, setTemperaturInnen] = useState(21);
  const [temperaturAussen, setTemperaturAussen] = useState(-8);
  const [luftwechselrate, setLuftwechselrate] = useState(0.3);

  const neuerRaum = () => ({
    name: '',
    baujahr: '1960-1970',
    sanierungsjahr: '',
    sanierteBauteile: [],
    geometrie: { laenge: 5, breite: 4, hoehe: 2.6 },
    volumen: 52,
    bauteile: {
      aussenwand: { flaecheAussen: 0 },
      innenwand: { flaecheUnbeheizt: 0, flaecheBeheizt: 0 },
      fenster: [{ anzahl: 1, flaecheProFenster: 1.5 }],
      dach: { typ: 'steildach', flaeche: 0 },
      boden: { typ: 'unbeheizt', flaeche: 0 }
    }
  });

  const raumHinzufuegen = () => {
    setRaeume([...raeume, neuerRaum()]);
  };

  const raumAktualisieren = (index, neuerRaum) => {
    const neueRaeume = [...raeume];
    neueRaeume[index] = neuerRaum;
    setRaeume(neueRaeume);
  };

  const raumLoeschen = (index) => {
    setRaeume(raeume.filter((_, i) => i !== index));
  };

  const getUWert = (raum, bauteil) => {
    const periode = raum.sanierteBauteile.includes(bauteil) && raum.sanierungsjahr
      ? raum.sanierungsjahr
      : raum.baujahr;
    return U_WERTE_KATALOG[periode][bauteil];
  };

  const berechneHeizlast = (raum) => {
    const deltaT = temperaturInnen - temperaturAussen;
    
    // Volumen berechnen
    const volumen = raum.geometrie.laenge * raum.geometrie.breite * raum.geometrie.hoehe;
    
    // U-Werte holen
    const uWerte = {
      dach: getUWert(raum, 'dach'),
      aussenwand: getUWert(raum, 'aussenwand'),
      fenster: getUWert(raum, 'fenster'),
      boden: getUWert(raum, 'boden')
    };

    // Transmissionswärmeverluste
    let qTransmission = 0;
    
    // Außenwände
    qTransmission += uWerte.aussenwand * raum.bauteile.aussenwand.flaecheAussen * deltaT;
    
    // Innenwände gegen unbeheizt (halber Temperaturunterschied)
    qTransmission += uWerte.aussenwand * raum.bauteile.innenwand.flaecheUnbeheizt * (deltaT / 2);
    
    // Fenster
    const fensterArray = Array.isArray(raum.bauteile.fenster) ? raum.bauteile.fenster : [];
    const fensterFlaeche = fensterArray.reduce((sum, f) => sum + (f.anzahl * f.flaecheProFenster), 0);
    qTransmission += uWerte.fenster * fensterFlaeche * deltaT;
    
    // Dach
    qTransmission += uWerte.dach * raum.bauteile.dach.flaeche * deltaT;
    
    // Boden
    if (raum.bauteile.boden.typ === 'aussen') {
      qTransmission += uWerte.boden * raum.bauteile.boden.flaeche * deltaT;
    } else if (raum.bauteile.boden.typ === 'unbeheizt') {
      qTransmission += uWerte.boden * raum.bauteile.boden.flaeche * (deltaT / 2);
    }
    
    // Lüftungswärmeverluste: Q_V = 0.34 × V × n × ΔT
    const qLueftung = 0.34 * volumen * luftwechselrate * deltaT;
    
    return {
      transmission: qTransmission,
      lueftung: qLueftung,
      gesamt: qTransmission + qLueftung,
      uWerte,
      volumen
    };
  };

  const gesamtHeizlast = raeume.reduce((sum, raum) => {
    const ergebnis = berechneHeizlast(raum);
    return sum + ergebnis.gesamt;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calculator className="text-blue-600" />
          Heizlastberechnung
        </h1>

        {/* Globale Parameter */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Innentemperatur (°C)
            </label>
            <input
              type="number"
              value={temperaturInnen}
              onChange={(e) => setTemperaturInnen(parseFloat(e.target.value) || 21)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Außentemperatur (°C)
            </label>
            <input
              type="number"
              value={temperaturAussen}
              onChange={(e) => setTemperaturAussen(parseFloat(e.target.value) || -8)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Luftwechselrate (1/h)
            </label>
            <input
              type="number"
              step="0.1"
              value={luftwechselrate}
              onChange={(e) => setLuftwechselrate(parseFloat(e.target.value) || 0.3)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Räume */}
      {raeume.map((raum, index) => (
        <RaumFormular
          key={index}
          raum={raum}
          index={index}
          onChange={raumAktualisieren}
          onDelete={raumLoeschen}
        />
      ))}

      {/* Raum hinzufügen Button */}
      <button
        onClick={raumHinzufuegen}
        className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mb-6"
      >
        <Plus size={24} />
        Raum hinzufügen
      </button>

      {/* Ergebnisse */}
      {raeume.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Berechnungsergebnisse</h2>
          
          {raeume.map((raum, index) => {
            const ergebnis = berechneHeizlast(raum);
            return (
              <div key={index} className="mb-6 p-4 border rounded bg-gray-50">
                <h3 className="font-semibold text-lg mb-3">
                  {raum.name || `Raum ${index + 1}`}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Volumen:</span>
                    <span className="font-medium ml-2">{ergebnis.volumen.toFixed(1)} m³</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Baujahr:</span>
                    <span className="font-medium ml-2">{raum.baujahr}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
                  <div className="bg-white p-2 rounded">
                    <div className="text-gray-600">U-Dach</div>
                    <div className="font-semibold">{ergebnis.uWerte.dach.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-gray-600">U-Wand</div>
                    <div className="font-semibold">{ergebnis.uWerte.aussenwand.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-gray-600">U-Fenster</div>
                    <div className="font-semibold">{ergebnis.uWerte.fenster.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-gray-600">U-Boden</div>
                    <div className="font-semibold">{ergebnis.uWerte.boden.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Transmission</div>
                    <div className="text-lg font-semibold text-orange-600">
                      {ergebnis.transmission.toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Lüftung</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {ergebnis.lueftung.toFixed(0)} W
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Gesamt</div>
                    <div className="text-xl font-bold text-green-600">
                      {ergebnis.gesamt.toFixed(0)} W
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {raeume.length > 1 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-xl mb-2">Gesamtheizlast aller Räume</h3>
              <div className="text-3xl font-bold text-green-700">
                {gesamtHeizlast.toFixed(0)} W
                <span className="text-lg font-normal text-gray-600 ml-3">
                  ({(gesamtHeizlast / 1000).toFixed(2)} kW)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeizlastRechner;