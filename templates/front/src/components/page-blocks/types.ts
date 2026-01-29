
export interface BlockContext {
  mode: 'preview' | 'front';
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface HeroBlockProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  alignment: 'left' | 'center' | 'right';
  overlay?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface HeadingBlockProps {
  content: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment: 'left' | 'center' | 'right';
}

export interface TextBlockProps {
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  width?: 'sm' | 'md' | 'lg' | 'full';
  alignment: 'left' | 'center' | 'right';
  rounded?: boolean;
}

export interface SpacerBlockProps {
  height: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ButtonBlockProps {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  alignment: 'left' | 'center' | 'right';
}

export interface DividerBlockProps {
  style: 'solid' | 'dashed' | 'dotted';
  color?: string;
  width: 'sm' | 'md' | 'lg' | 'full';
}

export interface QuoteBlockProps {
  content: string;
  author?: string;
  alignment: 'left' | 'center' | 'right';
  color?: string;
}

export interface ListBlockProps {
  items: string;
  style: 'bullet' | 'number' | 'check';
  alignment: 'left' | 'center' | 'right';
  color?: string;
}

export interface VideoBlockProps {
  url: string;
  title: string;
  aspectRatio: '16:9' | '4:3' | '1:1';
  alignment: 'left' | 'center' | 'right';
}

export interface GridBlockProps {
  columns: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  padding: 'none' | 'sm' | 'md' | 'lg';
}

export interface HeaderBlockProps {
  logoPosition: 'left' | 'center';
  showMenu: boolean;
  menuAlignment: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  sticky: boolean;
  height: 'sm' | 'md' | 'lg';
}

export type BlockPropsWithContext<T> = T & {
  context?: BlockContext;
};
