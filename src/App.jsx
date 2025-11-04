import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Home, Wind, MapPin, Info, ShoppingCart } from 'lucide-react';

// U-Werte Kataloge
const U_WERTE = {
  wand: {
    'Neubau': 0.15,
    '10 Jahre': 0.20,
    '20 Jahre': 0.30,
    '40 Jahre': 0.40,
    '> 40 Jahre': 1.0
  },
  fenster: {
    'Neu': 0.80,
    '10 Jahre': 1.10,
    '20 Jahre': 1.60,
    '40 Jahre': 2.2,
    '> 40 Jahre': 2.8
  },
  boden: {
    'Neubau': 0.20,
    '10 Jahre': 0.25,
    '20 Jahre': 0.35,
    '40 Jahre': 0.50,
    '> 40 Jahre': 1.0
  },
  dach: {
    'Neubau': 0.15,
    '10 Jahre': 0.20,
    '20 Jahre': 0.30,
    '40 Jahre': 0.40,
    '> 40 Jahre': 0.80
  }
};

const DACH_TYPEN = {
  'Flachdach': 1.0,
  'Schrägdach': 1.2,
  'Schrägdach mit Kaltestrich': 1.10,
  'Schrägdach mit Lukarne': 1.30,
  'Gegen beheizt': 1.0
};

const BODEN_TYPEN = [
  'Gegen beheizt',
  'Gegen unbeheizt (Keller)',
  'Gegen außen',
  'Gegen Erdreich'
];

const RAUMNUTZUNG = {
  'Wohnraum': { icon: '🛋️', temp: 21 },
  'Schlafzimmer': { icon: '🛏️', temp: 18 },
  'Badezimmer': { icon: '🚿', temp: 22 },
  'Küche': { icon: '🍳', temp: 21 }
};

const LUEFTUNG_ARTEN = [
  {
    name: 'Fensterlüftung',
    beschreibung: 'Natürliche Lüftung durch Öffnen der Fenster',
    luftwechsel: 0.5
  },
  {
    name: 'Komfortlüftung mit WRG',
    beschreibung: 'Mit Wärmerückgewinnung (70% Effizienz)',
    luftwechsel: 0.3
  }
];

const SCHRITT_NAMEN = {
  1: 'Grunddaten',
  2: 'Standort',
  3: 'Außenwände & Fenster',
  4: 'Dächer/Decken & Böden',
  5: 'Lüftung'
};

const berechneNormAussentemperatur = (hoehe) => {
  return -8 - (hoehe - 400) * 0.005;
};

const StepIndicator = ({ currentStep, totalSteps, onStepClick }) => {
  return (
    <div className="mb-8">
      <div className="text-center text-base font-medium text-gray-700 mb-4">
        {SCHRITT_NAMEN[currentStep]}
      </div>
      <div className="flex justify-between items-center">
        {[...Array(totalSteps)].map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <button
              onClick={() => onStepClick(i + 1)}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                i + 1 < currentStep ? 'bg-green-500 text-white hover:bg-green-600' : 
                i + 1 === currentStep ? 'bg-blue-500 text-white' : 
                'bg-gray-300 text-gray-600 hover:bg-gray-400'
              } font-bold text-lg transition cursor-pointer`}
            >
              {i + 1}
            </button>
            {i < totalSteps - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const InfoBox = ({ children, icon: Icon = Info }) => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex gap-3">
      <Icon className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="text-sm text-blue-800">{children}</div>
    </div>
  );
};

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-4"></div>
        </div>
      )}
    </div>
  );
};

const RaumFormular = ({ raum, index, onChange, onDelete, onComplete }) => {
  const [activeStep, setActiveStep] = useState(1);

  const handleChange = (field, value) => {
    onChange(index, { ...raum, [field]: value });
  };

  const handleWandChange = (wandIndex, field, value) => {
    const neueWaende = [...raum.waende];
    neueWaende[wandIndex] = { ...neueWaende[wandIndex], [field]: value };
    handleChange('waende', neueWaende);
  };

  const addWand = () => {
    handleChange('waende', [...raum.waende, { 
      richtung: 'Nord', 
      alter: 'Neubau',
      fensterAlter: 'Neu',
      flaeche: 12, 
      fensterFlaeche: 3 
    }]);
  };

  const removeWand = (wandIndex) => {
    handleChange('waende', raum.waende.filter((_, i) => i !== wandIndex));
  };

  const berechneVolumen = () => raum.grundflaeche * raum.raumhoehe;
  const berechneDachflaeche = () => raum.grundflaeche * (DACH_TYPEN[raum.dach.typ] || 1.0);
  const berechneBodenflaeche = () => raum.grundflaeche;

  const renderSchritt1 = () => (
    <div className="space-y-6">
      <InfoBox>
        Beginnen wir mit den Grundangaben zum Raum. Je präziser Ihre Angaben, desto genauer wird die Berechnung.
      </InfoBox>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Raumbezeichnung</label>
        <input
          type="text"
          value={raum.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50"
          placeholder="Wohnen"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Was wird der Raum genutzt?</label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(RAUMNUTZUNG).map(([nutzung, data]) => (
            <button
              key={nutzung}
              onClick={() => handleChange('nutzung', nutzung)}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                raum.nutzung === nutzung 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-4xl">{data.icon}</span>
              <span className="font-medium">{nutzung}</span>
              <span className="text-sm text-gray-600">{data.temp}°C Soll</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grundfläche (m²)
          </label>
          <input
            type="number"
            step="0.1"
            value={raum.grundflaeche}
            onChange={(e) => handleChange('grundflaeche', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Raumhöhe (m)
          </label>
          <input
            type="number"
            step="0.1"
            value={raum.raumhoehe}
            onChange={(e) => handleChange('raumhoehe', parseFloat(e.target.value) || 2.4)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50"
          />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <div className="text-sm font-medium text-green-800">
          Raumvolumen: <span className="text-lg">{berechneVolumen().toFixed(1)} m³</span>
        </div>
      </div>
    </div>
  );

  const renderSchritt2 = () => {
    const normTemp = berechneNormAussentemperatur(raum.standort.hoehe);
    return (
      <div className="space-y-6">
        <InfoBox icon={MapPin}>
          Der Standort bestimmt die Norm-Außentemperatur für die Berechnung.
        </InfoBox>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ort / PLZ</label>
          <input
            type="text"
            value={raum.standort.ort}
            onChange={(e) => handleChange('standort', { ...raum.standort, ort: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50"
            placeholder="Bern"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Höhe über Meer (m)</label>
          <input
            type="number"
            value={raum.standort.hoehe}
            onChange={(e) => handleChange('standort', { ...raum.standort, hoehe: parseFloat(e.target.value) || 400 })}
            className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50"
          />
        </div>

        <div className="text-xs text-gray-600">
          Zürich: 408m • Bern: 540m • Basel: 260m • Luzern: 435m • St. Gallen: 670m
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-800">
            Geschätzte Norm-Außentemperatur: <span className="text-lg">{normTemp.toFixed(1)}°C</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSchritt3 = () => (
    <div className="space-y-6">
      <InfoBox icon={Home}>
        Erfassen Sie nun die Außenwände mit Fenstern. Pro Himmelsrichtung eine Eingabe.
      </InfoBox>

      {raum.waende.map((wand, wIdx) => (
        <div key={wIdx} className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Wand {wIdx + 1}</h4>
            {raum.waende.length > 1 && (
              <button
                onClick={() => removeWand(wIdx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Himmelsrichtung</label>
              <select
                value={wand.richtung}
                onChange={(e) => handleWandChange(wIdx, 'richtung', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-blue-50"
              >
                {['Nord', 'Süd', 'Ost', 'West'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Bauweise / Dämmstandard Wand</label>
              <select
                value={wand.alter}
                onChange={(e) => handleWandChange(wIdx, 'alter', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm bg-blue-50"
              >
                {Object.entries(U_WERTE.wand).map(([alter, uWert]) => (
                  <option key={alter} value={alter}>
                    {alter} (U={uWert} W/m²K)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Fenster Alter / Qualität</label>
              <select
                value={wand.fensterAlter || 'Neu'}
                onChange={(e) => handleWandChange(wIdx, 'fensterAlter', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm bg-blue-50"
              >
                {Object.entries(U_WERTE.fenster).map(([alter, uWert]) => (
                  <option key={alter} value={alter}>
                    {alter} (U={uWert} W/m²K)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-bold">Wandfläche (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={wand.flaeche}
                  onChange={(e) => handleWandChange(wIdx, 'flaeche', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded bg-blue-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-bold">Fensterfläche (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={wand.fensterFlaeche}
                  onChange={(e) => handleWandChange(wIdx, 'fensterFlaeche', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded bg-blue-50"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addWand}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
      >
        + Weitere Wand hinzufügen
      </button>
    </div>
  );

  const renderSchritt4 = () => (
    <div className="space-y-6">
      <InfoBox icon={Home}>
        Erfassen Sie nun die Dächer/Decken und Böden des Raums.
      </InfoBox>

      <div>
        <h4 className="font-medium mb-4 text-base">Boden / Decke zu unbeheizten Räumen</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1 flex items-center gap-2">
              Bodentyp
              <Tooltip text="Die Bodenfläche kann in verschiedene Segmente aufgeteilt werden, bspw. Wenn ein Teil des Boden gegen aussen und ein Teil gegen beheizt ist.">
                <Info size={14} className="text-blue-500" />
              </Tooltip>
            </label>
            <select
              value={raum.boden.typ}
              onChange={(e) => handleChange('boden', { ...raum.boden, typ: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded bg-blue-50"
            >
              {BODEN_TYPEN.map(typ => (
                <option key={typ} value={typ}>{typ}</option>
              ))}
            </select>
          </div>

          {raum.boden.typ !== 'Gegen beheizt' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dämmstandard</label>
              <select
                value={raum.boden.alter}
                onChange={(e) => handleChange('boden', { ...raum.boden, alter: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-blue-50"
              >
                {Object.entries(U_WERTE.boden).map(([alter, uWert]) => (
                  <option key={alter} value={alter}>{alter} (U={uWert} W/m²K)</option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <div className="text-sm text-green-800 font-medium">
              Bodenfläche: {berechneBodenflaeche().toFixed(2)} m²
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-4 text-base">Dach / Decke nach oben</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1 flex items-center gap-2">
                Dachtyp
                <Tooltip text="Zuschlagsfaktoren zur Gebäudegrundfläche in Abhängigkeit des Dachtyps. Es wird von einem einheitlichen Dachtyp ausgegangen. Lukarnen werden ebenfalls über Zuschlagsfaktoren berücksichtig (vereinfachte Berechnung).">
                  <Info size={14} className="text-blue-500" />
                </Tooltip>
              </label>
              <select
                value={raum.dach.typ}
                onChange={(e) => handleChange('dach', { ...raum.dach, typ: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-blue-50"
              >
                {Object.keys(DACH_TYPEN).map(typ => (
                  <option key={typ} value={typ}>{typ}</option>
                ))}
              </select>
            </div>

            {raum.dach.typ !== 'Gegen beheizt' && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Dämmstandard</label>
                <select
                  value={raum.dach.alter}
                  onChange={(e) => handleChange('dach', { ...raum.dach, alter: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded bg-blue-50"
                >
                  {Object.entries(U_WERTE.dach).map(([alter, uWert]) => (
                    <option key={alter} value={alter}>{alter} (U={uWert} W/m²K)</option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <div className="text-sm text-green-800 font-medium">
                Dachfläche: {berechneDachflaeche().toFixed(2)} m²
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchritt5 = () => (
    <div className="space-y-6">
      <InfoBox icon={Wind}>
        Die Lüftung ist ein wichtiger Faktor für den Wärmeverlust.
      </InfoBox>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Lüftungsart</label>
        <div className="space-y-3">
          {LUEFTUNG_ARTEN.map((art, idx) => (
            <button
              key={idx}
              onClick={() => handleChange('lueftung', art.name)}
              className={`w-full p-4 border-2 rounded-lg text-left transition ${
                raum.lueftung === art.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{art.name}</div>
              <div className="text-sm text-gray-600 mt-1">{art.beschreibung}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-3 rounded">
        <div className="text-sm text-gray-700">
          <strong>Luftwechselrate für {raum.nutzung || 'Wohnraum'}:</strong> {
            LUEFTUNG_ARTEN.find(a => a.name === raum.lueftung)?.luftwechsel || 0.5
          } 1/h
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch(activeStep) {
      case 1: return renderSchritt1();
      case 2: return renderSchritt2();
      case 3: return renderSchritt3();
      case 4: return renderSchritt4();
      case 5: return renderSchritt5();
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {raum.name || `Raum ${index + 1}`}
          </h3>
          {raum.canAddMore !== undefined && (
            <div className="text-sm text-gray-600 mt-1">
              Raum {index + 1} von maximal 3
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(index)}
          className="text-red-500 hover:text-red-700 p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <StepIndicator currentStep={activeStep} totalSteps={5} />

      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeStep === 1 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          Zurück
        </button>
        
        {activeStep === 5 ? (
          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="px-6 py-3 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <Calculator size={20} />
              Speichern & Zur Übersicht
            </button>
            {raum.canAddMore && raum.onAddAnother && (
              <button
                onClick={() => {
                  raum.onAddAnother();
                  setActiveStep(1);
                }}
                className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Speichern & Weiterer Raum
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveStep(activeStep + 1)}
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Weiter
          </button>
        )}
      </div>
    </div>
  );
};

const HeizlastRechner = () => {
  const [raeume, setRaeume] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const neuerRaum = () => ({
    name: '',
    nutzung: 'Wohnraum',
    grundflaeche: 20,
    raumhoehe: 2.4,
    standort: { ort: '', hoehe: 540 },
    waende: [{ richtung: 'Nord', alter: 'Neubau', fensterAlter: 'Neu', flaeche: 12, fensterFlaeche: 3 }],
    dach: { typ: 'Flachdach', alter: 'Neubau' },
    boden: { typ: 'Gegen unbeheizt (Keller)', alter: 'Neubau' },
    lueftung: 'Fensterlüftung',
    canAddMore: false,
    onAddAnother: null
  });

  const berechneHeizlast = (raum) => {
    const normAussenTemp = berechneNormAussentemperatur(raum.standort.hoehe);
    const innenTemp = RAUMNUTZUNG[raum.nutzung]?.temp || 21;
    const deltaT = innenTemp - normAussenTemp;
    const volumen = raum.grundflaeche * raum.raumhoehe;
    
    let qTransmission = 0;
    
    raum.waende.forEach(wand => {
      const uWand = U_WERTE.wand[wand.alter];
      const uFenster = U_WERTE.fenster[wand.fensterAlter || 'Neu'];
      
      qTransmission += uWand * wand.flaeche * deltaT;
      qTransmission += uFenster * wand.fensterFlaeche * deltaT;
    });
    
    if (raum.dach.typ !== 'Gegen beheizt') {
      const uDach = U_WERTE.dach[raum.dach.alter];
      const dachFlaeche = raum.grundflaeche * DACH_TYPEN[raum.dach.typ];
      qTransmission += uDach * dachFlaeche * deltaT;
    }
    
    if (raum.boden.typ !== 'Gegen beheizt') {
      const uBoden = U_WERTE.boden[raum.boden.alter];
      const bodenFlaeche = raum.grundflaeche;
      
      if (raum.boden.typ === 'Gegen unbeheizt (Keller)' || raum.boden.typ === 'Gegen Erdreich') {
        qTransmission += uBoden * bodenFlaeche * (deltaT / 2);
      } else {
        qTransmission += uBoden * bodenFlaeche * deltaT;
      }
    }
    
    const luftwechsel = LUEFTUNG_ARTEN.find(a => a.name === raum.lueftung)?.luftwechsel || 0.5;
    const qLueftung = 0.34 * volumen * luftwechsel * deltaT;
    
    const qGesamt = qTransmission + qLueftung;
    const spezifisch = raum.grundflaeche > 0 ? qGesamt / raum.grundflaeche : 0;
    
    return {
      transmission: qTransmission,
      lueftung: qLueftung,
      gesamt: qGesamt,
      spezifisch,
      volumen,
      innenTemp,
      aussenTemp: normAussenTemp,
      deltaT
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Heizlastrechner</h1>
          <p className="text-gray-600 mt-1">Nach DIN EN 12831 · Vereinfachte Berechnung</p>
        </div>
        {raeume.length > 0 && !showResults && (
          <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
            <ShoppingCart size={20} />
            <span className="font-semibold">{raeume.length}/3</span>
          </div>
        )}
      </div>

      {raeume.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calculator size={64} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Heizlastberechnung starten</h2>
          <p className="text-gray-600 mb-8">
            Berechnen Sie die Heizlast nach DIN EN 12831 (vereinfachte Methode)
          </p>
          <button
            onClick={() => setRaeume([neuerRaum()])}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-lg"
          >
            Neue Berechnung starten
          </button>
        </div>
      )}

      {raeume.length > 0 && !showResults && (
        <RaumFormular
          raum={{
            ...raeume[currentRoomIndex],
            canAddMore: raeume.length < 3,
            onAddAnother: () => {
              setRaeume([...raeume, neuerRaum()]);
              setCurrentRoomIndex(raeume.length);
            }
          }}
          index={currentRoomIndex}
          onChange={(i, neuerRaumData) => {
            const neueRaeume = [...raeume];
            neueRaeume[currentRoomIndex] = neuerRaumData;
            setRaeume(neueRaeume);
          }}
          onDelete={() => {
            setRaeume([]);
            setShowResults(false);
            setCurrentRoomIndex(0);
          }}
          onComplete={() => setShowResults(true)}
        />
      )}

      {raeume.length > 0 && showResults && (
        <div className="space-y-6">
          {raeume.map((raum, index) => {
            const ergebnis = berechneHeizlast(raum);
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-lg font-semibold text-gray-700 mb-4">
                  Raum {index + 1}: {raum.name || 'Ohne Namen'}
                </div>

                <div className="bg-blue-500 text-white rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm opacity-90 mb-1">Berechnete Heizlast</div>
                      <div className="text-5xl font-bold">{Math.round(ergebnis.gesamt)} W</div>
                      <div className="text-sm opacity-90 mt-2">
                        ≈ {ergebnis.spezifisch.toFixed(0)} W/m²
                      </div>
                    </div>
                    <Calculator size={48} className="opacity-75" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-700 mb-1">Transmissionsverluste</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round(ergebnis.transmission)} W
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {((ergebnis.transmission / ergebnis.gesamt) * 100).toFixed(0)}% vom Total
                    </div>
                  </div>

                  <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-700 mb-1">Lüftungsverluste</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round(ergebnis.lueftung)} W
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {((ergebnis.lueftung / ergebnis.gesamt) * 100).toFixed(0)}% vom Total
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raum:</span>
                    <span className="font-medium">{raum.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nutzung:</span>
                    <span className="font-medium">{raum.nutzung}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grundfläche:</span>
                    <span className="font-medium">{raum.grundflaeche} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Norm-Innentemperatur:</span>
                    <span className="font-medium">{ergebnis.innenTemp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Norm-Außentemperatur:</span>
                    <span className="font-medium">{ergebnis.aussenTemp.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperaturdifferenz:</span>
                    <span className="font-medium">{ergebnis.deltaT.toFixed(1)} K</span>
                  </div>
                </div>
              </div>
            );
          })}

          {raeume.length > 1 && (
            <div className="bg-green-500 text-white rounded-lg p-8 shadow-lg">
              <div className="text-xl font-semibold mb-4">Gesamtheizlast aller Räume</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-6xl font-bold">
                    {Math.round(raeume.reduce((sum, r) => sum + berechneHeizlast(r).gesamt, 0))} W
                  </div>
                  <div className="text-lg opacity-90 mt-2">
                    {(raeume.reduce((sum, r) => sum + berechneHeizlast(r).gesamt, 0) / 1000).toFixed(2)} kW
                  </div>
                </div>
                <Calculator size={64} className="opacity-75" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex gap-3">
                <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-yellow-800">
                  <strong>Hinweis:</strong> Dies ist eine vereinfachte Berechnung für kleine Projekte. Für verbindliche Dimensionierungen wenden Sie sich bitte an einen Fachplaner.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setRaeume([]);
                setShowResults(false);
                setCurrentRoomIndex(0);
              }}
              className="w-full p-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              Neue Berechnung starten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeizlastRechner;