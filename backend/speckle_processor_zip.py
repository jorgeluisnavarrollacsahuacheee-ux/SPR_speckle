import cv2
import numpy as np
from pathlib import Path
import glob


def compute_iv(img):
    return float(np.mean(img))


def compute_zncc(ref, img):
    ref = ref.astype(np.float32)
    img = img.astype(np.float32)

    ref_n = (ref - ref.mean()) / ref.std()
    img_n = (img - img.mean()) / img.std()

    return float(np.mean(ref_n * img_n))


def compute_rssd(ref, img):
    return float(np.sum((ref.astype(np.float32) - img.astype(np.float32)) ** 2))


def analyze_sample_zip(reference_path: str, folder_path: str):
    ref = cv2.imread(reference_path, cv2.IMREAD_GRAYSCALE)

    images = sorted(glob.glob(str(Path(folder_path) / "*.png")))

    ivs, znccs, rssds = [], [], []

    for im_path in images:
        img = cv2.imread(im_path, cv2.IMREAD_GRAYSCALE)

        ivs.append(compute_iv(img))
        znccs.append(compute_zncc(ref, img))
        rssds.append(compute_rssd(ref, img))

    return {
        "iv": float(np.mean(ivs)),
        "zncc": float(np.mean(znccs)),
        "rssd": float(np.mean(rssds)),
        "n_images": len(images)
    }
