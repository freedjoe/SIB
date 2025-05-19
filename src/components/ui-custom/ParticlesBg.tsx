import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import type { ISourceOptions } from "tsparticles-engine";
import { useSettings } from "@/contexts/SettingsContext";

type ParticlesBgProps = {
  type: "matrix" | "network";
};

export default function ParticlesBg({ type = "network" }: ParticlesBgProps) {
  const { theme } = useSettings();

  // Determine dark mode directly from theme settings
  const isDark =
    theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const getOptions = useCallback(() => {
    if (type === "matrix") {
      return {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: isDark ? "#00ff00" : "#006600",
          },
          shape: {
            type: "char",
            character: {
              value: ["0", "1"],
              font: "Verdana",
              style: "",
              weight: "400",
            },
          },
          opacity: {
            value: isDark ? 0.8 : 0.6,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: isDark ? 0.1 : 0.05,
              sync: false,
            },
          },
          size: {
            value: 16,
            random: true,
          },
          move: {
            enable: true,
            speed: 3,
            direction: "bottom" as const,
            random: false,
            straight: false,
            outMode: "out",
            bounce: false,
          },
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "repulse",
            },
          },
        },
        retina_detect: true,
        background: {
          color: isDark ? "#000000" : "#f8f8f8",
          image: "",
          position: "50% 50%",
          repeat: "no-repeat",
          size: "cover",
        },
      };
    } else {
      return {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: isDark ? "#ffffff" : "#000000",
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: isDark ? 0.8 : 0.7,
            random: false,
          },
          size: {
            value: isDark ? 4 : 3,
            random: true,
          },
          links: {
            enable: true,
            distance: 150,
            color: isDark ? "#ffffff" : "#000000",
            opacity: isDark ? 0.6 : 0.5,
            width: isDark ? 1.5 : 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none" as const,
            random: false,
            straight: false,
            outMode: "out" as const,
            bounce: false,
          },
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 1,
              },
            },
            push: {
              particles_nb: 4,
            },
          },
        },
        retina_detect: true,
        background: {
          color: isDark ? "#0d2538" : "#f0f4f8",
          image: "",
          position: "50% 50%",
          repeat: "no-repeat",
          size: "cover",
        },
      };
    }
  }, [isDark, type]);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={getOptions()}
      className="absolute inset-0 -z-10"
    />
  );
}
