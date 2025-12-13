"""Convert non-WebP images to WebP and clamp width to 1600px.

Usage:
	python convert.py [root_dir]
"""

import argparse
import os
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps


MAX_WIDTH = 1600
SOURCE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff", ".tif"}


def iter_source_files(root: Path) -> Iterable[Path]:
	for dirpath, _, filenames in os.walk(root):
		for name in filenames:
			path = Path(dirpath) / name
			ext = path.suffix.lower()
			if ext in SOURCE_EXTS:
				yield path


def convert_image(src: Path) -> None:
	dst = src.with_suffix(".webp")

	with Image.open(src) as im:
		im = ImageOps.exif_transpose(im)
		if im.mode in ("P", "LA"):
			im = im.convert("RGBA")
		elif im.mode == "CMYK":
			im = im.convert("RGB")

		width, height = im.size
		if width > MAX_WIDTH:
			new_height = int(height * MAX_WIDTH / width)
			im = im.resize((MAX_WIDTH, new_height), Image.LANCZOS)

		save_kwargs = {"format": "WEBP", "method": 6}
		if "A" in im.getbands():
			save_kwargs.update({"lossless": True})
		else:
			save_kwargs.update({"quality": 85, "optimize": True})

		im.save(dst, **save_kwargs)

	print(f"Converted: {src} -> {dst}")


def main() -> None:
	parser = argparse.ArgumentParser(description="Convert images to WebP at max 1600px width.")
	parser.add_argument("root", nargs="?", default=".", help="Root folder to scan (default: current directory)")
	args = parser.parse_args()

	root = Path(args.root).resolve()
	if not root.exists():
		raise SystemExit(f"Path does not exist: {root}")

	for src in iter_source_files(root):
		convert_image(src)


if __name__ == "__main__":
	main()
