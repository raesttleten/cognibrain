# CogniBrain

Página web del semillero de psicología con **seis juegos cortos de atención** y su pantalla de resultados. No tiene inicio de sesión, puntos, mascota ni backend. Todo pasa en el navegador.

- **Funciona sin internet:** es una PWA. Después de la primera visita, la página abre y se juega sin conexión, y se puede instalar como app en el computador o el celular.
- **Mis resultados:** cada partida terminada se guarda en el dispositivo (localStorage) y aparece en el inicio, debajo de los juegos.

| Juego | Habilidad | Resultados que muestra |
| --- | --- | --- |
| A Todo Foco | Atención sostenida | X que tocaste, X que se escapó, toques en otra letra, tiempo de reacción |
| Repite el Patrón | Memoria de trabajo | colores seguidos que recordaste, rondas completadas, errores |
| Sigue el Punto | Seguimiento visual | veces que lo seguiste, tiempo de respuesta |
| Encuentra el Par | Atención selectiva | pares encontrados, toques errados, tiempo promedio por ronda |
| Semáforo Atento | Atención e inhibición | verdes que tocaste, verdes que se escaparon, rojas que tocaste, tiempo de reacción |
| Caza Figuras | Atención selectiva | estrellas encontradas, estrellas sin encontrar, figuras equivocadas, tiempo total |

Las métricas siguen la Tabla 4.2 de la tesis de FocusLap. El diseño sale del mockup de Figma "CogniBrain – Mockups".

## Cómo se juega cada uno

- **A Todo Foco:** 36 letras (9 son X). Cada letra dura 0,9 s con 0,9 s de pausa. Se toca el recuadro o la barra espaciadora solo con la X.
- **Repite el Patrón:** 4 cuadros de colores. La secuencia empieza en 2, sube de a uno hasta 9 y termina al primer error.
- **Sigue el Punto:** 5 rondas con 6 puntos. Uno se marca 1,5 s, los puntos se mueven 3 veces y luego se toca el que estaba marcado.
- **Encuentra el Par:** 6 rondas. Entre 12 figuras hay solo dos iguales (misma forma y tono). Con 3 pares errados se pasa a la siguiente ronda.
- **Semáforo Atento:** 10 luces (6 verdes). Cada luz dura 1,5 s. Se toca solo en verde. Al final aparece "Ver resultados".
- **Caza Figuras:** tablero de 8×4 con 12 estrellas. Acierto en dorado, error en rosado. Termina al encontrar las 12 o con "Ver resultados".

## Requisitos

- Node.js 18 o superior.

## Comandos

```bash
npm install          # primera vez
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run build        # build para publicar, en dist/
npm run preview      # sirve dist/ en http://localhost:4173
npm run build:single # un solo archivo: dist-single/index.html
```

`dist-single/index.html` se abre con doble clic, sin servidor ni internet: trae el código, la fuente Fredoka y los íconos dentro del mismo archivo. Esta versión **no** tiene service worker (los navegadores no lo permiten en `file://`), pero sí guarda el historial.

## Funciona sin internet (PWA)

La build normal (`npm run build`) usa `vite-plugin-pwa`:

- Un service worker guarda en el navegador todos los archivos de la build: HTML, JS, CSS, las fuentes Fredoka y los íconos. Desde la segunda carga la página abre sin red.
- El manifest (`manifest.webmanifest`) tiene nombre "CogniBrain", idioma español, colores del diseño e íconos de 192 y 512 px, incluido uno "maskable". Con eso el navegador ofrece **Instalar app**.
- Las versiones nuevas se descargan solas (`registerType: 'autoUpdate'`). Cuando hay una, aparece abajo un aviso pequeño: "Hay una versión nueva de CogniBrain" con **Actualizar** y **Después**. El aviso **no aparece durante una partida**; sale en el inicio, en las instrucciones o en los resultados.
- El service worker solo funciona en `https://` o en `localhost`. En `npm run dev` está apagado.

### Cómo probarlo sin conexión

1. `npm run build` y luego `npm run preview`.
2. Abre http://localhost:4173 en Chrome o Edge y espera a que cargue.
3. DevTools (F12) → **Application** → **Service Workers**: debe aparecer `sw.js` como *activated and is running*.
4. Marca **Offline** en esa misma pantalla (o en la pestaña Network) y recarga.
5. La página abre igual. Juega los 6 juegos hasta los resultados y vuelve al inicio: cada partida aparece en "Mis resultados".

## Mis resultados (historial en el dispositivo)

- Al terminar cada partida se guarda `{ gameId, gameTitle, date, items }` con las mismas métricas de la pantalla de resultados, en `localStorage` con la clave `cognibrain:history`.
- Se conservan las **últimas 100 partidas**; las más antiguas se descartan.
- En el inicio, la sección "Mis resultados" muestra las partidas más recientes (juego, fecha y hora, métricas), de 10 en 10 con **Ver más**, y un botón **Borrar historial** que pide confirmación.
- El botón **Descargar CSV** baja al computador el archivo `cognibrain-resultados-AAAA-MM-DD.csv` con todas las partidas guardadas, listo para abrir en Excel. Tiene una fila por métrica con las columnas `Fecha; Hora; Juego; Métrica; Valor; Total; Unidad` (por ejemplo, "7 / 9 X que tocaste" queda como Valor 7 y Total 9; "612 ms" como Valor 612 y Unidad ms). Usa punto y coma como separador y coma decimal, como el Excel en español, y funciona también sin internet.
- Los datos quedan solo en ese navegador y ese dispositivo. No se guarda nombre ni ningún dato personal. Si el navegador no permite `localStorage` (por ejemplo, algunos modos privados), la página sigue funcionando y lo avisa.

## Publicar en Vercel

Una PWA necesita HTTPS; Vercel lo da automáticamente en el link `https://<proyecto>.vercel.app`.

### Opción A: desde GitHub (recomendada)

1. Sube el proyecto a un repositorio de GitHub (`git push`).
2. Entra a https://vercel.com y crea una cuenta con **Continue with GitHub**.
3. **Add New… → Project** y elige el repositorio `cognibrain` → **Import**.
4. Vercel detecta Vite. Revisa que quede así:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Pulsa **Deploy**. En uno o dos minutos te da el link `https://cognibrain-xxxx.vercel.app`, que es el que compartes.
6. Cada `git push` a `main` publica una versión nueva. Quien ya tenga la página abierta verá el aviso "Hay una versión nueva".

### Opción B: desde la terminal, sin GitHub

1. `npm run build`
2. `npx vercel login` (abre el navegador para iniciar sesión).
3. `npx vercel deploy dist --prod`
4. La primera vez pregunta el nombre del proyecto y el alcance; acepta los valores sugeridos. Al final imprime el link de producción.

Para repetir la publicación: `npm run build` y otra vez `npx vercel deploy dist --prod`.

### Después de publicar

- Abre el link una vez con internet. Desde ahí funciona sin conexión en ese dispositivo.
- En Chrome o Edge de computador aparece el ícono **Instalar** en la barra de direcciones. En Android: menú ⋮ → **Instalar app**. En iPhone (Safari): Compartir → **Agregar a inicio**.
- No hace falta `vercel.json`: Vercel sirve los archivos estáticos con `max-age=0, must-revalidate`, así que los navegadores detectan las versiones nuevas de `sw.js`.

## Estructura

```
src/
  App.jsx               inicio, "Mis resultados" y navegación entre pantallas (sin router)
  main.jsx              punto de entrada, fuentes y registro del service worker
  pwa.js                registro del service worker y aviso de versión nueva
  storage.js            leer, guardar y borrar el historial en localStorage
  csv.js                exportar el historial a CSV y descargarlo
  styles.css            todos los estilos y colores del diseño
  utils.js              temporizadores, barra espaciadora y utilidades
  assets/               ícono del cerebro y estrella de resultados
  components/           Header, Shape, GameScreen, History y UpdateNotice
  games/index.jsx       catálogo de los 6 juegos
  games/*.jsx           un archivo por juego
public/                 favicon e íconos de la PWA (192, 512, maskable, apple-touch)
```

Para agregar o cambiar un juego se edita su archivo en `src/games/` y su entrada en `src/games/index.jsx`.
