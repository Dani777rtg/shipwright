# Respuestas fijas de la entrevista

- Confidencialidad: se permite enviar el código a Claude (autoriza el líder técnico).
- Usuarios: clientes internos de la API.
- Objetivo: listar solo las tareas terminadas o solo las pendientes.
- Métrica: 0 tests existentes rotos; el filtro devuelve solo las tareas del estado pedido.
- Calidad (orden): no romper nada, consistencia con el código actual, seguridad.
- Valor de `done` distinto de `true` o `false`: responder 400 con `{ "error": "done must be true or false" }`.
- Sin dependencias nuevas.
- Plataforma: no aplica (se entrega PR).
- Idioma: español.
- Fuera de alcance: paginación, orden, búsqueda por texto.
