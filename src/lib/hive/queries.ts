export const SEARCH_NOTES = `
MATCH (n:Note)
SEARCH n IN (FULLTEXT INDEX note_text FOR $q LIMIT $k)
SCORE AS score
RETURN n.id AS id, n.title AS title, n.body AS body, n.date AS date, score
ORDER BY score DESC
`;

export const NEIGHBORS = `
MATCH (a)-[r]-(b)
WHERE a.id IN $ids
RETURN a.id AS from, b.id AS id, labels(b) AS labels, type(r) AS rel,
       startNode(r).id AS startId, endNode(r).id AS endId,
       coalesce(b.title, '') AS title, coalesce(b.name, '') AS name,
       coalesce(b.text, '') AS text, coalesce(b.body, '') AS body,
       coalesce(b.date, '') AS date, coalesce(b.status, '') AS status,
       coalesce(b.reason, '') AS reason
LIMIT $limit
`;

export const NODE_COUNTS = `
MATCH (n)
RETURN labels(n) AS labels, count(*) AS count
`;

export const RELATIONSHIP_COUNTS = `
MATCH ()-[r]->()
RETURN type(r) AS type, count(*) AS count
`;

export const INSERT_ANSWER = `
CREATE (:Answer {id: $id, question: $question, text: $text, at: $at, mode: $mode})
`;

export const LINK_ANSWER = `
MATCH (a:Answer {id: $id})
UNWIND $usedIds AS uid
MATCH (n) WHERE n.id = uid
CREATE (a)-[:USED]->(n)
`;

export const LINK_ANCHOR = `
MATCH (a:Answer {id: $id}), (d:Decision {id: $decisionId})
CREATE (a)-[:ANSWERED_WITH]->(d)
`;

export const STALE_ANSWERS = `
MATCH (a:Answer)-[:ANSWERED_WITH]->(d:Decision {status: 'superseded'})
RETURN a.id AS id, a.question AS question, a.at AS at, d.text AS decision
ORDER BY a.at DESC
LIMIT 40
`;
