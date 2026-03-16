import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { VALID_CATEGORIES, DB_CATEGORIES } from '../types';

const citationSchema = z.object({
  text: z.string().min(1, 'Le texte est requis'),
  author: z.string().min(1, "L'auteur est requis"),
  authorDescription: z.string().min(1, "La description de l'auteur est requise"),
  category: z.enum(DB_CATEGORIES),
});

const bulkCreateSchema = z.object({
  citations: z.array(citationSchema).min(1, 'Au moins une citation est requise'),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'Au moins un identifiant est requis'),
});

export async function getRandomCitation(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;

    if (category && !VALID_CATEGORIES.includes(category as any)) {
      res.status(400).json({
        error: `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(', ')}`,
      });
      return;
    }

    const where = category && category !== 'toutes' ? { category } : {};

    const count = await prisma.citation.count({ where });

    if (count === 0) {
      res.status(404).json({ error: 'Aucune citation trouvée pour cette catégorie.' });
      return;
    }

    const skip = Math.floor(Math.random() * count);
    const citation = await prisma.citation.findFirst({ where, skip });

    res.json({ data: citation });
  } catch (err) {
    next(err);
  }
}

export async function getCitations(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;

    if (category && !VALID_CATEGORIES.includes(category as any)) {
      res.status(400).json({
        error: `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(', ')}`,
      });
      return;
    }

    const where = category && category !== 'toutes' ? { category } : {};

    const citations = await prisma.citation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: citations, total: citations.length });
  } catch (err) {
    next(err);
  }
}

export async function getCitationById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const citation = await prisma.citation.findUnique({ where: { id } });

    if (!citation) {
      res.status(404).json({ error: 'Citation introuvable.' });
      return;
    }

    res.json({ data: citation });
  } catch (err) {
    next(err);
  }
}

export async function createCitation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = citationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.flatten() });
      return;
    }

    const citation = await prisma.citation.create({ data: parsed.data });
    res.status(201).json({ data: citation });
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateCitations(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.flatten() });
      return;
    }

    const result = await prisma.citation.createMany({ data: parsed.data.citations });
    res.status(201).json({ message: `${result.count} citation(s) créée(s) avec succès.`, count: result.count });
  } catch (err) {
    next(err);
  }
}

export async function updateCitation(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);

    const parsed = citationSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.flatten() });
      return;
    }

    const exists = await prisma.citation.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ error: 'Citation introuvable.' });
      return;
    }

    const citation = await prisma.citation.update({ where: { id }, data: parsed.data });
    res.json({ data: citation });
  } catch (err) {
    next(err);
  }
}

export async function deleteCitation(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);

    const exists = await prisma.citation.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ error: 'Citation introuvable.' });
      return;
    }

    await prisma.citation.delete({ where: { id } });
    res.json({ message: 'Citation supprimée avec succès.' });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteCitations(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkDeleteSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Données invalides.', details: parsed.error.flatten() });
      return;
    }

    const result = await prisma.citation.deleteMany({
      where: { id: { in: parsed.data.ids } },
    });

    res.json({ message: `${result.count} citation(s) supprimée(s) avec succès.`, count: result.count });
  } catch (err) {
    next(err);
  }
}
