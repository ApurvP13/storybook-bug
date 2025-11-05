import type { Meta, StoryObj } from '@storybook/react-webpack5';

interface GithubChipProps {
  repoName: string;
  onRemove: () => void;
  chatStarted: boolean;
  isInChat?: boolean;
}

function GithubChip({
  repoName,
  onRemove,
  chatStarted,
  isInChat = false,
}: GithubChipProps) {
  const chipClasses = isInChat
    ? "h-6 px-2 py-1 text-xs"
    : `px-3 py-2 ${chatStarted ? "text-sm" : "text-base"}`;

  return (
    <div className="relative mr-2 group">
      <div className={`inline-flex items-center gap-1 ${chipClasses} rounded-full bg-fiddle-elements-background-depth-2 border border-fiddle-elements-borderColor text-fiddle-elements-textPrimary`}>
        <span className="i-ph:github-logo-fill" />
        {repoName}
      </div>
      <button
        onClick={onRemove}
        className={`absolute -top-2 -right-2 bg-fiddle-elements-code-background text-white rounded-full ${isInChat ? "w-4 h-4" : "w-6 h-6"} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
        title="Remove Repository"
      >
        <span className={`i-ph:x ${isInChat ? "text-[10px]" : ""}`} />
      </button>
    </div>
  );
}

const meta: Meta<typeof GithubChip> = {
  title: 'UnoCSS/GithubChip',
  component: GithubChip,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    repoName: {
      control: 'text',
    },
    onRemove: {
      action: 'removed',
    },
    chatStarted: {
      control: 'boolean',
    },
    isInChat: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GithubChip>;

export const Default: Story = {
  args: {
    repoName: 'fiddle-website',
    chatStarted: false,
    isInChat: false,
  },
};

export const InChat: Story = {
  args: {
    repoName: 'storybook-unocss-repro',
    chatStarted: true,
    isInChat: true,
  },
};

