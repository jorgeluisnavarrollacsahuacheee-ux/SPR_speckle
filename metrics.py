import numpy as np


def IV(I):
    """
    Calcula el promedio de intensidad (Average Intensity Value)
    según la ecuación (1) del paper:
    
    IV(I) = sum(I) / (M * N)
    
    Donde:
      - I: imagen (numpy array 2D)
      - M, N: dimensiones de la imagen
    """
    M, N = I.shape
    return np.sum(I) / (M * N)


def ZNCC(I, I0):
    """
    Calcula el Zero-mean Normalized Cross-Correlation (ZNCC)
    según la ecuación (2) del paper:
    
    ZNCC = sum((I - Ī)*(I0 - Ī0)) /
           sqrt(sum((I - Ī)^2) * sum((I0 - Ī0)^2))
    
    Donde:
      - I: imagen promedio (muestra)
      - I0: imagen promedio (referencia)
    """
    I_mean = np.mean(I)
    I0_mean = np.mean(I0)

    numerator = np.sum((I - I_mean) * (I0 - I0_mean))
    denominator = np.sqrt(np.sum((I - I_mean)**2) * np.sum((I0 - I0_mean)**2))

    if denominator == 0:
        return 0.0
    return numerator / denominator


def rSSD(I, I0):
    """
    Calcula el relative Sum of Squared Differences (rSSD)
    según la ecuación (3) del paper:
    
    rSSD = sum((I - I0)^2) / (M * N)
    
    Donde:
      - I: imagen promedio (muestra)
      - I0: imagen promedio (referencia)
    """
    M, N = I.shape
    return np.sum((I - I0)**2) / (M * N)
pygame.cursors.load_xbm(cursorfile, maskfile)