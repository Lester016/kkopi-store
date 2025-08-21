export const cleanDocument = (doc: any, isRoot = false): any => {
  if (Array.isArray(doc)) {
    return doc.map((d) => cleanDocument(d));
  }

  if (doc !== null && typeof doc === 'object') {
    // Destructure out system fields
    const { _id, __v, createdAt, updatedAt, user, userId, ...rest } = doc;

    const cleaned: any = {};
    for (const key in rest) {
      cleaned[key] = cleanDocument(rest[key]); // recurse deeply
    }

    // normalize id
    if (_id) cleaned.id = _id.toString();

    // keep timestamps only if this is the root doc
    if (isRoot) {
      if (createdAt) cleaned.createdAt = createdAt;
      if (updatedAt) cleaned.updatedAt = updatedAt;
    }

    return cleaned;
  }

  return doc; // primitive
};
