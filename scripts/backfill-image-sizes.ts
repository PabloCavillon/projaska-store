// Mide las fotos ya guardadas que no tienen medidas (imageWidth null) y guarda ancho y alto.
// Uso: npx tsx scripts/backfill-image-sizes.ts   (toma DATABASE_URL de .env.local / .env.production / el entorno)
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env.production" });

const PARALLEL = 10;

const main = async () => {
	const { prisma } = await import("@/lib/prisma");
	const { downloadImage, measureImage } = await import("@/lib/product-image");

	const products = await prisma.product.findMany({
		where: { imageUrl: { not: null }, imageWidth: null },
		select: { id: true, sku: true, imageUrl: true },
	});
	console.log(`${products.length} fotos sin medir`);

	let ok = 0;
	const failed: string[] = [];
	for (let i = 0; i < products.length; i += PARALLEL) {
		await Promise.all(products.slice(i, i + PARALLEL).map(async (p) => {
			try {
				const size = await measureImage((await downloadImage(p.imageUrl!)).body);
				await prisma.product.update({ where: { id: p.id }, data: size });
				ok++;
			} catch (e) {
				const msg = `${p.sku} (${p.id}) ${p.imageUrl}: ${e instanceof Error ? e.message : e}`;
				failed.push(msg);
				console.error(`✗ ${msg}`);
			}
		}));
		console.log(`${Math.min(i + PARALLEL, products.length)}/${products.length}`);
	}

	console.log(`\n${ok} medidas, ${failed.length} fallaron.`);
	await prisma.$disconnect();
	if (failed.length) process.exitCode = 1;
};

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
