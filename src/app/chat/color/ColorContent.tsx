import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import "../../../../i18n";
import DynamicText from "../../../app/components/DynamicText";

const socket = io("http://localhost:3000", { path: "/api/socket" });

export default function ColorContent() {
  const { t, i18n } = useTranslation("common");
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  const ThemeColors: Record<string, string> = {
    themePink: "#91034F",
    themeYellow: "#9F7000",
    themeGreen: "#4E5B02",
    themeBlue: "#030391",
    themeDarkBlue: "#02025B",
    themeBlack: "#01012B",
  };

  // Set CSS variables for the theme
  const applyTheme = (top: string, middle: string, bottom: string) => {
    document.documentElement.style.setProperty("--top-color", top);
    document.documentElement.style.setProperty("--middle-color", middle);
    document.documentElement.style.setProperty("--bottom-color", bottom);
  };

  // Handle theme change
  const handleThemeChange = (color: string, section: "top" | "middle" | "bottom") => {
    if (!session?.user?.id) return;
    
    const updatedTheme = {
        section,
        color,
      };
    console.log(`
        
        
        
        handleThemeChange
        
        
        
        
        
        `,session.user.id,updatedTheme )
    // Emit the updated theme via WebSocket
    socket.emit("change_theme", {
      userId: session.user.id,
      ...updatedTheme,
    });

   // Apply the theme locally
  if (section === "top") {
    document.documentElement.style.setProperty("--top-color", color);
  } else if (section === "middle") {
    document.documentElement.style.setProperty("--middle-color", color);
  } else if (section === "bottom") {
    document.documentElement.style.setProperty("--bottom-color", color);
  }
  };

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => setIsInitialized(true);
      i18n.on("initialized", handleInitialized);
      return () => {
        i18n.off("initialized", handleInitialized);
      };
    }
  }, [i18n]);

  // Fetch the user's initial theme from the database
  useEffect(() => {
    const fetchTheme = async () => {
      if (!session?.user?.id) return;

      const response = await fetch(`/api/theme?userId=${session.user.id}`);
      const { top, middle, bottom } = await response.json();
      applyTheme(top, middle, bottom);
    };

    fetchTheme();

    // Listen for theme updates from WebSocket
    socket.on("theme_updated", ({ userId, section, color }) => {
        if (session?.user?.id.toString() === userId.toString()) {
        if (section === "top") {
            document.documentElement.style.setProperty("--top-color", color);
        } else if (section === "middle") {
            document.documentElement.style.setProperty("--middle-color", color);
        } else if (section === "bottom") {
            document.documentElement.style.setProperty("--bottom-color", color);
        }
        }
    });

    return () => {
      socket.off("theme_updated");
    };
  }, [session]);

  if (!isInitialized) return null;

  return (
    <div className="mx-auto p-8 rounded-lg h-full text-customBlue ">
      <h2 className="text-2xl font-bold mb-4">
        <DynamicText text={t("Color")} />
      </h2>

      <div className="h-[80%] flex flex-col justify-center items-center gap-12">
        {["top", "middle", "bottom"].map((section) => (
          <div key={section}>
            <DynamicText text={t(section.charAt(0).toUpperCase() + section.slice(1))} className="text-sm text-customPurple" />
            <div className="flex gap-2 mt-2">
              {Object.keys(ThemeColors).map((key) => (
                <div
                  key={key}
                  className={`w-6 h-6 rounded-full cursor-pointer border border-white hover:scale-125 `}
                  style={{ backgroundColor: ThemeColors[key] }}
                  onClick={() => handleThemeChange(ThemeColors[key], section as "top" | "middle" | "bottom")}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
