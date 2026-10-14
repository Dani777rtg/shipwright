# Respuestas fijas de la entrevista

- Confidencialidad: se permite enviar el código a Claude (autoriza el líder técnico).
- Usuarios: clientes internos de la API; 50 usuarios.
- Objetivo: que nadie vea ni modifique tareas ajenas.
- Métricas: 0 accesos cruzados en tests; 0 tests existentes rotos.
- Calidad (orden): no romper nada, seguridad, consistencia con el código actual.
- Tokens: emitidos por un endpoint `POST /login` con usuario y contraseña; expiran en 1 h.
- Sin dependencias nuevas salvo que un ADR lo justifique.
- Plataforma: no aplica (se entrega PR).
- Idioma: español.
- Fuera de alcance: registro de usuarios, recuperación de contraseña.
