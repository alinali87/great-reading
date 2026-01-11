import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ReadingModeToggle } from '../ReadingModeToggle';
import userEvent from '@testing-library/user-event';

describe('ReadingModeToggle', () => {
  it('should render both mode buttons', () => {
    const onModeChange = vi.fn();
    render(<ReadingModeToggle mode="page" onModeChange={onModeChange} />);
    
    expect(screen.getByRole('button', { name: /page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sentence/i })).toBeInTheDocument();
  });

  it('should highlight page mode when active', () => {
    const onModeChange = vi.fn();
    render(<ReadingModeToggle mode="page" onModeChange={onModeChange} />);
    
    const pageButton = screen.getByRole('button', { name: /page/i });
    const sentenceButton = screen.getByRole('button', { name: /sentence/i });
    
    expect(pageButton).toHaveClass('bg-background');
    expect(sentenceButton).not.toHaveClass('bg-background');
  });

  it('should highlight sentence mode when active', () => {
    const onModeChange = vi.fn();
    render(<ReadingModeToggle mode="sentence" onModeChange={onModeChange} />);
    
    const pageButton = screen.getByRole('button', { name: /page/i });
    const sentenceButton = screen.getByRole('button', { name: /sentence/i });
    
    expect(sentenceButton).toHaveClass('bg-background');
    expect(pageButton).not.toHaveClass('bg-background');
  });

  it('should call onModeChange with "page" when page button is clicked', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    render(<ReadingModeToggle mode="sentence" onModeChange={onModeChange} />);
    
    const pageButton = screen.getByRole('button', { name: /page/i });
    await user.click(pageButton);
    
    expect(onModeChange).toHaveBeenCalledWith('page');
    expect(onModeChange).toHaveBeenCalledTimes(1);
  });

  it('should call onModeChange with "sentence" when sentence button is clicked', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    render(<ReadingModeToggle mode="page" onModeChange={onModeChange} />);
    
    const sentenceButton = screen.getByRole('button', { name: /sentence/i });
    await user.click(sentenceButton);
    
    expect(onModeChange).toHaveBeenCalledWith('sentence');
    expect(onModeChange).toHaveBeenCalledTimes(1);
  });

  it('should allow clicking the already active mode', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    render(<ReadingModeToggle mode="page" onModeChange={onModeChange} />);
    
    const pageButton = screen.getByRole('button', { name: /page/i });
    await user.click(pageButton);
    
    expect(onModeChange).toHaveBeenCalledWith('page');
  });
});
