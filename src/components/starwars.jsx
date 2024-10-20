import React, {useEffect, useRef} from 'react';
import {Howl} from 'howler';

export default function StarWarsIntro({onClose}) {
    const soundRef = useRef(null);
    const crawlRef = useRef(null);

    useEffect(() => {
        soundRef.current = new Howl({
            src: ['/src/assets/audio.mp3'], volume: 0.5, loop: true, onend: () => console.log('Finished playing'),
        });

        soundRef.current.play();

        const handleAnimationEnd = () => {
            if (crawlRef.current) {
                crawlRef.current.style.animation = 'none';
                crawlRef.current.offsetHeight; // Trigger reflow
                crawlRef.current.style.animation = null;
            }
        };

        crawlRef.current.addEventListener('animationend', handleAnimationEnd);

        return () => {
            soundRef.current?.stop();
            if (crawlRef.current) {
                crawlRef.current.removeEventListener('animationend', handleAnimationEnd);
            }
        };
    }, []);

    return (<div className="star-wars-intro">
        <div className="fade"></div>
        <section className="star-wars">
            <div className="crawl" ref={crawlRef}>
                <div className="title">
                    <p>Episodio I</p>
                    <h1>EL ASCENSO DE RED FOX</h1>
                </div>

                <p>EN UNA GALAXIA NO TAN LEJANA, EN LA VASTA EXPANSIÓN DEL CIBERESPACIO, UNA NUEVA FUERZA EMERGE. LA
                    ALIANZA RED FOX, UN GRUPO DE VALIENTES DESARROLLADORES, SE ALZA CONTRA EL IMPERIO DEL CÓDIGO
                    LEGACY Y LOS BUGS OSCUROS QUE AMENAZAN LA PAZ EN EL UNIVERSO DIGITAL.</p>

                <p>LIDERADOS POR EL INTRÉPIDO JEDI DEL CÓDIGO, MIJAEL OLIVER ALANDIA VARGAS, ESTOS GUERREROS DE LA
                    PROGRAMACIÓN SE EMBARCAN EN UNA MISIÓN ÉPICA PARA FORJAR UNA APLICACIÓN TAN PODEROSA QUE PODRÍA
                    RESTAURAR EL EQUILIBRIO EN LA FUERZA DEL DESARROLLO.</p>

                <p>OLIVER Y PEDRO, LOS MAESTROS DEL BACKEND, MANIPULAN LOS FLUJOS DE DATOS CON LA PRECISIÓN DE UN
                    SABLE DE LUZ, MIENTRAS DIEGO Y CRISTIAN, LOS CABALLEROS DEL FRONTEND, TEJEN INTERFACES TAN
                    DESLUMBRANTES COMO LAS ESTRELLAS DE TATOOINE.</p>

                <p>LA GUARDIANA JEDI PAOLA VIGILA EL CÓDIGO CON LA AGUDEZA DE UN DROIDE DE COMBATE, ASEGURANDO QUE
                    NINGÚN BUG ESCAPE A SU ESCRUTINIO. SU DEDICACIÓN ES EL ESCUDO QUE PROTEGE LA INTEGRIDAD DE LA
                    MISIÓN.</p>

                <p>PERO LAS FUERZAS OSCURAS ACECHAN. EN UN GIRO INESPERADO, PEDRO ES SEDUCIDO POR EL LADO OSCURO DEL
                    FREELANCING, ABANDONANDO LA CAUSA. EL EQUIPO SE TAMBALEA, PERO SU DETERMINACIÓN BRILLA MÁS QUE
                    UN SABLE DE LUZ EN LA OSCURIDAD.</p>

                <p>ENFRENTANDO ESTE DESAFÍO, OLIVER EMERGE COMO UN MAESTRO JEDI FULL STACK, DOMINANDO TANTO EL
                    FRONTEND COMO EL BACKEND CON LA GRACIA DE UN MAESTRO YODA DEL CÓDIGO.</p>

                <p>MIENTRAS TANTO, CRISTIAN, COMO UN SABIO OBI-WAN, REDIRIGE SU ENERGÍA PARA CONVERTIRSE EN EL
                    CRONISTA DE LA MISIÓN, DOCUMENTANDO CADA BATALLA Y VICTORIA EN LOS ARCHIVOS JEDI DEL
                    PROYECTO.</p>

                <p>A MEDIDA QUE AVANZAN LOS CICLOS ESTELARES, LA ALIANZA RED FOX EVOLUCIONA. DIEGO SE CONVIERTE EN
                    UN MAESTRO DE LAS ARTES FRONTEND, CREANDO INTERFACES QUE RIVALIZAN CON LA BELLEZA DE LOS ANILLOS
                    DE SATURNO.</p>

                <p>PAOLA Y LA RECIÉN LLEGADA GEOVANA FORMAN UN DÚO TAN FORMIDABLE COMO HAN SOLO Y CHEWBACCA, SU
                    ATENCIÓN AL DETALLE Y BÚSQUEDA DE LA PERFECCIÓN ELEVAN EL PROYECTO A ALTURAS DIGNAS DE LA
                    ESTRELLA DE LA MUERTE.</p>

                <p>GUIADOS POR LA SABIDURÍA DE LA GRAN MAESTRA JEDI CORINA FLORES, EL EQUIPO RED FOX NAVEGA POR EL
                    HIPERESPACIO DEL DESARROLLO DE SOFTWARE. SUS ENSEÑANZAS SON EL FARO QUE GUÍA A TRAVÉS DE LOS
                    AGUJEROS DE GUSANO DE LOS SPRINTS Y LAS NEBULOSAS DE LOS DEADLINES.</p>

                <p>CON CADA COMMIT, CADA PULL REQUEST, Y CADA DESPLIEGUE, LA ALIANZA RED FOX CRECE MÁS FUERTE.
                    SUPERAN OBSTÁCULOS CON LA AGILIDAD DE UN X-WING, CONQUISTAN NUEVAS TECNOLOGÍAS COMO SI FUERAN
                    NUEVOS SISTEMAS ESTELARES, Y FORJAN UN FUTURO TAN BRILLANTE COMO EL NÚCLEO DE UNA ESTRELLA.</p>

                <p>QUE LA FUERZA DEL CÓDIGO LES ACOMPAÑE EN SU ÉPICA AVENTURA, MIENTRAS SE ELEVAN HACIA LAS
                    ESTRELLAS DEL ÉXITO EN LA INFINITA GALAXIA DEL DESARROLLO DE SOFTWARE. LA BATALLA CONTRA LOS
                    BUGS Y EL CÓDIGO SPAGUETTI APENAS COMIENZA, PERO LA ALIANZA RED FOX ESTÁ LISTA PARA ENFRENTAR
                    CUALQUIER DESAFÍO QUE EL UNIVERSO DIGITAL LES PRESENTE...</p>
            </div>
        </section>
        <button
            className="close-button"
            onClick={() => {
                soundRef.current?.stop();
                onClose();
            }}
        >
            CERRAR
        </button>
        <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=News+Cycle:wght@700&display=swap');

            .star-wars-intro {
                background: #000;
                color: #feda4a;
                font-family: 'News Cycle', sans-serif;
                font-size: 350%;
                font-weight: 700;
                height: 100vh;
                left: 0;
                overflow: hidden;
                position: fixed;
                top: 0;
                width: 100vw;
                z-index: 9999;
            }

            .fade {
                background-image: linear-gradient(0deg, transparent, black 75%);
                height: 50vh;
                position: relative;
                width: 100%;
                z-index: 1;
            }

            .star-wars {
                display: flex;
                height: 100%;
                justify-content: center;
                perspective: 400px;
                position: relative;
                width: 100%;
            }

            .crawl {
                animation: crawl 90s linear infinite;
                position: relative;
                top: 100vh;
                transform-origin: 50% 100%;
            }

            .crawl > .title {
                font-size: 100%;
                text-align: center;
            }

            .crawl > .title h1 {
                margin: 0 0 100px;
                text-transform: uppercase;
            }

            .crawl p {
                font-size: 100%;
                line-height: 2;
                margin: 0 auto 1em;
                max-width: 100%;
                text-align: justify;
            }

            @keyframes crawl {
                0% {
                    top: 100vh;
                    transform: rotateX(25deg) translateZ(0);
                }
                100% {
                    top: -6000px;
                    transform: rotateX(25deg) translateZ(-2500px);
                }
            }

            .close-button {
                background-color: #feda4a;
                border: none;
                border-radius: 5px;
                color: #000;
                cursor: pointer;
                font-family: 'News Cycle', sans-serif;
                font-size: 16px;
                font-weight: 700;
                padding: 10px 20px;
                position: fixed;
                right: 20px;
                top: 20px;
                z-index: 10000;
            }

            @media (max-width: 600px) {
                .star-wars-intro {
                    font-size: 200%;
                }

                .crawl p {
                    font-size: 100%;
                    max-width: 100%;
                }
            }

            @media (min-width: 601px) and (max-width: 1024px) {
                .star-wars-intro {
                    font-size: 400%;
                }

                .crawl p {
                    font-size: 100%;
                    max-width: 100%;
                }
            }
        `}</style>
    </div>);
}