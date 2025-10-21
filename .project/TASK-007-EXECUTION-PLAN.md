# TASK-007: Fix Connection Point Configuration (R19)

**Date**: October 20, 2025  
**Status**: 🟡 In Progress  
**Epic**: EPIC-001 - Foundation Infrastructure  
**Story**: Story-001 - Core System Stability  
**Priority**: Medium  
**Effort**: 4-6 hours

══════════════════════════════════════════════════════════

## Requirement Analysis (R19)

### Current State

**BaseNode.tsx** (Default behavior):
- Input Handle: Position.Top (hardcoded)
- Output Handle: Position.Bottom (hardcoded)
- ❌ Does NOT support Left/Right positions

**Custom Nodes** (LoopNode, LogicConditionNode):
- Use custom Handle placement
- Limited to specific positions per node type
- ❌ Not flexible/configurable

### R19 Requirements

**R19.1 Flexible Connection Points**:
- [ ] Input ports accept connections from **top OR left** edge
- [ ] Output ports allow connections from **bottom OR right** edge
- [ ] Connection routing automatically selects optimal path
- [ ] Visual feedback shows available connection points during wiring
- [ ] Connection point selection is context-aware based on flow direction

### Gap Analysis

| Requirement | Current | Gap |
|-------------|---------|-----|
| Input from top | ✅ Yes | None |
| Input from left | ❌ No | Need to add |
| Output from bottom | ✅ Yes | None |
| Output from right | ❌ No | Need to add |
| Multiple handles per node | ❌ Limited | Need flexible system |
| Optimal routing | ❌ No | Need connection logic |
| Visual feedback | ⚠️ Basic | Need enhancement |
| Context-aware selection | ❌ No | Need smart positioning |

══════════════════════════════════════════════════════════

## Implementation Plan

### Phase 1: BaseNode Enhancement (2 hours)

**1.1 Add Configurable Handle Positions**
- Add props for input/output positions
- Support multiple handles per direction
- Maintain backward compatibility

**1.2 Update BaseNode Interface**
```typescript
interface BaseNodeProps {
  // ... existing props
  inputPositions?: Position[]; // [Position.Top, Position.Left]
  outputPositions?: Position[]; // [Position.Bottom, Position.Right]
  handleConfig?: {
    inputs?: Array<{
      id: string;
      position: Position;
      className?: string;
    }>;
    outputs?: Array<{
      id: string;
      position: Position;
      className?: string;
    }>;
  };
}
```

**1.3 Default Behavior**
- If no positions specified: use current Top/Bottom (backward compatible)
- If positions specified: render handles at specified locations
- Support multiple handles per node

### Phase 2: Node Type Definitions Update (1.5 hours)

**2.1 Update nodeDefinitions.ts**
- Add handle configuration to each node type
- Define optimal input/output positions per node type
- Document connection patterns

**2.2 Connection Rules**
- Command nodes: Input Top/Left, Output Bottom/Right
- Logic nodes: Input Top, Outputs Left/Right/Bottom
- Loop nodes: Multiple handles with clear labels
- Persona/Instruction: Input Top/Left, Output Bottom
- Trigger nodes: Output only (Bottom/Right)

### Phase 3: Smart Connection Routing (1 hour)

**3.1 Connection Path Optimization**
- Detect node positions relative to each other
- Select optimal handle based on layout
- Prefer shorter, cleaner paths

**3.2 Visual Feedback Enhancement**
- Highlight available connection points on hover
- Show compatibility indicators
- Animate connection preview

### Phase 4: Testing & Documentation (1.5 hours)

**4.1 Unit Tests**
- Test handle rendering with different configurations
- Test connection validation with new positions
- Test backward compatibility

**4.2 Integration Tests**
- Test drag-and-drop connections
- Test connection path selection
- Test multi-handle nodes

**4.3 Documentation**
- Update component documentation
- Add handle configuration examples
- Document connection patterns

══════════════════════════════════════════════════════════

## Files to Modify

### Core Components
- [ ] `BaseNode.tsx` - Add flexible handle configuration
- [ ] `nodeDefinitions.ts` - Update node type definitions with handle configs
- [ ] `FlowCanvas.tsx` - Enhance connection logic (if needed)

### Node Components (Update to use new system)
- [ ] `CommandPromptNode.tsx`
- [ ] `CustomPromptNode.tsx`
- [ ] `LogicConditionNode.tsx`
- [ ] `LoopNode.tsx`
- [ ] `OutputFormatterNode.tsx`
- [ ] `PersonaNode.tsx`
- [ ] `InstructionNode.tsx`
- [ ] `InjectorNode.tsx`

### Tests
- [ ] `BaseNode.test.tsx` (create if missing)
- [ ] `FlowCanvas.test.tsx` (update connection tests)
- [ ] Integration test for R19 acceptance criteria

### Documentation
- [ ] Component README updates
- [ ] Connection pattern documentation
- [ ] Task completion report

══════════════════════════════════════════════════════════

## Success Criteria

**Functional**:
- [ ] Nodes can have input handles on top AND left
- [ ] Nodes can have output handles on bottom AND right
- [ ] Connections work correctly with all handle positions
- [ ] Visual feedback shows available connection points
- [ ] No regression in existing functionality

**Quality**:
- [ ] All tests passing
- [ ] 99%+ test coverage maintained
- [ ] Zero TypeScript errors
- [ ] Clean code review (no linting issues)

**Acceptance** (R19.1):
- [ ] Input ports accept connections from top OR left edge ✅
- [ ] Output ports allow connections from bottom OR right edge ✅
- [ ] Connection routing automatically selects optimal path ✅
- [ ] Visual feedback shows available connection points ✅
- [ ] Connection point selection is context-aware ✅

══════════════════════════════════════════════════════════

## Execution Strategy

**Approach**: Incremental with backward compatibility
1. Enhance BaseNode with optional new props (Phase 1)
2. Update node definitions gradually (Phase 2)
3. Add smart routing as enhancement (Phase 3)
4. Comprehensive testing throughout (Phase 4)

**Risk Mitigation**:
- Keep existing Position.Top/Bottom as defaults
- Add new positions as opt-in feature
- Test each node type individually
- Run full validation suite after each phase

**Quality Gates**:
- TypeScript compilation after each file edit
- Unit test suite after Phase 1
- Integration tests after Phase 2
- Full QA after Phase 4

══════════════════════════════════════════════════════════

**Plan Created**: October 20, 2025 09:15  
**Estimated Start**: October 20, 2025 09:20  
**Estimated Completion**: October 20, 2025 14:20 (5 hours)

Ready to execute Phase 1...
