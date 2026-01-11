import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { MinimalTimer } from '../MinimalTimer';
import userEvent from '@testing-library/user-event';

describe('MinimalTimer', () => {
  it('should render play and reset buttons when not running', () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    
    render(
      <MinimalTimer 
        isRunning={false} 
        progress={1} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should render pulsing indicator when running', () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    
    const { container } = render(
      <MinimalTimer 
        isRunning={true} 
        progress={0.5} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('should call onToggle when play button is clicked', async () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    const user = userEvent.setup();
    
    render(
      <MinimalTimer 
        isRunning={false} 
        progress={1} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // First button is play
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onReset when reset button is clicked', async () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    const user = userEvent.setup();
    
    render(
      <MinimalTimer 
        isRunning={false} 
        progress={1} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // Second button is reset
    
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should call onToggle when pulsing indicator is clicked', async () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    const user = userEvent.setup();
    
    render(
      <MinimalTimer 
        isRunning={true} 
        progress={0.5} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const pauseButton = screen.getByTitle('Pause timer');
    await user.click(pauseButton);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should apply different styles based on progress', () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    
    const { container, rerender } = render(
      <MinimalTimer 
        isRunning={true} 
        progress={1} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const scaledElement = container.querySelector('.opacity-50');
    expect(scaledElement).toHaveStyle({ transform: 'scale(1)' });
    
    rerender(
      <MinimalTimer 
        isRunning={true} 
        progress={0} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const updatedElement = container.querySelector('.opacity-50');
    expect(updatedElement).toHaveStyle({ transform: 'scale(1.5)' });
  });

  it('should toggle between running and not running states', () => {
    const onToggle = vi.fn();
    const onReset = vi.fn();
    
    const { container, rerender } = render(
      <MinimalTimer 
        isRunning={false} 
        progress={1} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    expect(screen.getAllByRole('button')).toHaveLength(2);
    
    rerender(
      <MinimalTimer 
        isRunning={true} 
        progress={1} 
        onToggle={onToggle} 
        onReset={onReset} 
      />
    );
    
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });
});
