import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				blue: '#1B405D',
				blue50: '#E3F2FD',
				blue75: '#BBDEFB',
				blue100: '#122d42',
				blue150: '#90CAF9',
				blue175: '#64B5F6',
				blue200: '#0D6EFD',
				blue300: '#0B5ACF',
				blue400: '#0947A1',
				blue500: '#073472',
				blue600: '#052144',
				blue700: '#03101A',
				green100: '#B8D047',
				green200: '#198754',
				white: '#FFFFFF',
				grey: '#D9D9D9',
				red: '#DC3545',
				red50: '#F8D7DA',
				red100: '#F1BFC3',
				red200: '#EA979D',
				red300: '#E37078',
				red400: '#DC4954',
				red500: '#D52230',
				red600: '#C01526',
				red700: '#b52b39',
				yellow: '#FFC107',
				yellow100: '#FFF3CD',
				yellow200: '#FFEC99',
				yellow300: '#FFE066',
				yellow400: '#FFD633',
				yellow500: '#FFC107',
				yellow600: '#FFB300',
				yellow700: '#FF9E00',
				yellow800: '#FF8C00',
				pink100: '#F8D7DA',
				pink200: '#F5B0B5',
				pink300: '#F07A8B',
				pink400: '#E6006D',
				pink500: '#D50059',
				pink600: '#C1004F',
				pink700: '#A50044',
				pink800: '#8A0038',
				purple200: '#D8B4FE', // ✅ Roxo claro bem usado em dashboards modernos
				purple300: '#C084FC', // ✅ Muito comum em sites de tecnologia e startups
				purple400: '#A855F7', // ✅ Roxo vibrante, mas ainda aceitável em UI moderna
				purple500: '#9333EA', // ✅ Muito usado em fintechs, SaaS e sites de dev
				purple600: '#7E22CE', // ❌ Mais saturado, pode cansar se usado em excesso
				purple700: '#6B21A8', // ❌ Roxo muito forte, evitar como cor principal
				purple800: '#581C87', // ❌ Roxo escuro pesado, só usar como detalhe ou texto
				orange200: '#FED7AA', // ✅ Laranja pastel, leve, usado em landing pages
				orange300: '#FDBA74', // ✅ Laranja suave, muito comum em e-commerce
				orange400: '#FB923C', // ✅ Laranja vivo, ótimo pra call-to-action (botões)
				orange500: '#F97316', // ✅ Muito usado em botões e highlights (ex: Amazon)
				orange600: '#EA580C', // ❌ Já começa a ficar forte demais
				orange700: '#C2410C', // ❌ Laranja queimado, bom só pra detalhes pequenos
				orange800: '#9A3412', // ❌ Muito escuro, só pra contrastes extremos
				purpleDeep: '#4B2E5D', // Roxo escuro, meio uva, elegante e não enjoa
				wineDark: '#5D1B2E',    // Vinho queimado, sóbrio
				greenMuted: '#1B5D40',  // Verde escuro acinzentado, sofisticado
				brownGray: '#3B2E2A',   // Marrom café acinzentado
				grayPurple: '#3D3A4F',  // Cinza arroxeado moderno, usado em SaaS
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
