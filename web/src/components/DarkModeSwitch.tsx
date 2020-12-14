import { useColorMode, IconButton } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

export const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <IconButton
      // position="fixed"
      // top="1rem"
      // right="1rem"
      aria-label="Toggle theme"
      onClick={toggleColorMode}
      icon={isDark ? <SunIcon /> : <MoonIcon />}
    />
  );
};
