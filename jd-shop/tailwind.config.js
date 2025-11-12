/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1.5rem',
				sm: '1.5rem',
				lg: '3rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
			},
		},
		extend: {
			colors: {
				// 背景层
				background: {
					primary: '#ffffff',
					surface: '#fafafa',
					divider: '#e5e5e5',
				},
				// 文字层
				text: {
					primary: '#1a1a1a',
					secondary: '#525252',
					tertiary: '#a3a3a3',
				},
				// 品牌层
				brand: {
					DEFAULT: '#000000',
					hover: '#1a1a1a',
				},
				// CTA按钮
				cta: {
					primary: '#000000',
					'primary-hover': '#1a1a1a',
					'primary-alt': '#ff6b35',
					'primary-alt-hover': '#ff5216',
					secondary: 'transparent',
					'secondary-border': '#525252',
				},
				// 语义色
				success: '#10b981',
				error: '#dc2626',
				warning: '#d97706',
				info: '#0066ff',
			},
			fontSize: {
				'h1': '40px',
				'h2': '28px',
				'price-current': '32px',
				'price-original': '20px',
				'badge': '12px',
			},
			spacing: {
				'8': '8px',
				'12': '12px',
				'16': '16px',
				'24': '24px',
				'32': '32px',
				'48': '48px',
				'64': '64px',
			},
			borderRadius: {
				'sm': '4px',
				'md': '8px',
				'lg': '12px',
				'full': '9999px',
			},
			boxShadow: {
				'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
				'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
				'modal': '0 8px 24px rgba(0, 0, 0, 0.15)',
			},
			transitionDuration: {
				'fast': '150ms',
				'base': '250ms',
				'slow': '400ms',
				'feedback': '600ms',
			},
			keyframes: {
				'cart-success': {
					'0%': { transform: 'scale(1)', background: '#000000' },
					'50%': { transform: 'scale(1.05)', background: '#10b981' },
					'100%': { transform: 'scale(1)', background: '#000000' },
				},
			},
			animation: {
				'cart-success': 'cart-success 600ms ease-in-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
