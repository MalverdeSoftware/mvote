import { Frame as SharedFrame } from '@malverdesoftware/ui';

export default function Frame({ children }) {
  return <SharedFrame appName="mVote">{children}</SharedFrame>;
}
