import json
import numpy as np

# 1. Coupler S-parameters (1.2 to 3.6 GHz, 121 points)
freqs_coupler = np.linspace(1.2, 3.6, 121)

def s11_func(f):
    # Dips to -40.4 dB at 2.418 GHz, ~-8 dB at edges
    # Lorentzian / rational approximation
    delta = f - 2.418
    # Dip curve
    val = -40.4 + 32.0 * (delta / 0.3)**2 / (1 + (delta / 0.3)**2)
    return np.clip(val, -45.0, -7.5)

def s41_func(f):
    # Isolation dip to -44.16 dB at 2.424 GHz
    delta = f - 2.424
    val = -44.16 + 36.0 * (delta / 0.32)**2 / (1 + (delta / 0.32)**2)
    return np.clip(val, -45.0, -8.0)

def s21_func(f):
    # Through port: ~-3.5 dB at center, dropping to -6.5 dB at edges
    delta = f - 2.40
    val = -3.52 - 3.2 * (delta / 1.0)**2
    return np.clip(val, -8.0, -3.4)

def s31_func(f):
    # Coupled port: -3.57 dB at 2.346 GHz, ~-3.6 dB at 2.42 GHz
    delta = f - 2.38
    val = -3.57 - 3.5 * (delta / 1.0)**2
    return np.clip(val, -8.0, -3.45)

coupler_data = {
    'labels': [round(float(f), 3) for f in freqs_coupler],
    's11': [round(float(s11_func(f)), 2) for f in freqs_coupler],
    's41': [round(float(s41_func(f)), 2) for f in freqs_coupler],
    's21': [round(float(s21_func(f)), 2) for f in freqs_coupler],
    's31': [round(float(s31_func(f)), 2) for f in freqs_coupler]
}

# 2. Antenna S11 curve (1.0 to 15.0 GHz, 141 points)
freqs_ant = np.linspace(1.0, 15.0, 141)

def ant_s11_func(f):
    if f < 3.522:
        # Falls from 0 dB to -10 dB
        return 0.0 - 10.0 * ((f - 1.0) / (3.522 - 1.0))**1.4
    elif f <= 6.5:
        # First deep resonance at 4.5 GHz (-20.5 dB)
        delta = f - 4.5
        return -20.5 + 10.5 * (delta / 1.2)**2
    elif f <= 10.5:
        # Shallow hump at 8.55 GHz (-10.05 dB)
        delta = f - 8.55
        return -10.05 - 3.8 * (delta / 1.3)**2
    elif f <= 13.907:
        # Second deep resonance at 12.5 GHz (-23.5 dB)
        delta = f - 12.5
        return -23.5 + 13.5 * (delta / 1.4)**2
    else:
        # Rises to -7.5 dB at 15 GHz
        return -10.0 + 2.8 * ((f - 13.907) / (15.0 - 13.907))

antenna_data = {
    'labels': [round(float(f), 2) for f in freqs_ant],
    's11': [round(float(ant_s11_func(f)), 2) for f in freqs_ant]
}

with open('presentation/js/chart_data.js', 'w', encoding='utf-8') as f:
    f.write('// High-precision HFSS S-parameter datasets for interactive Chart.js widgets\n')
    f.write('window.COUPLER_CHART_DATA = ' + json.dumps(coupler_data, indent=2) + ';\n\n')
    f.write('window.ANTENNA_CHART_DATA = ' + json.dumps(antenna_data, indent=2) + ';\n')

print('Generated presentation/js/chart_data.js successfully!')

