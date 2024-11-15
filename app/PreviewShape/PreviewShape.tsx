/* eslint-disable react-hooks/rules-of-hooks */
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	HTMLContainer,
	toDomPrecision,
	Icon,
	useToasts,
	DefaultSpinner,
	stopEventPropagation,
	Vec2d,
	useValue,
} from '@tldraw/tldraw'
import { UrlLinkButton } from '../components/UrlLinkButton'
import Modal from 'react-modal'
import { useState, useEffect, useRef } from 'react'
import { CodeEditorComponent } from './CodeEditorComponent'

import AceEditor from 'react-ace'
import 'brace/mode/html'
import 'brace/theme/github'
import Draggable from 'react-draggable';

export type PreviewShape = TLBaseShape<
	'preview',
	{
		html: string
		source: string
		w: number
		h: number
	}
>

export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			source: '',
			w: 300,
			h: 500,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShape) => false
	override canResize = (_shape: PreviewShape) => true
	override canBind = (_shape: PreviewShape) => false
	override canUnmount = () => false

	
	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		const [isModalOpen, setIsModalOpen] = useState(false)
		const [localHtml, setLocalHtml] = useState(shape.props.html)
		const [isSaving, setIsSaving] = useState(false)
		const [hasChanges, setHasChanges] = useState(false)
		const containerRef = useRef<HTMLDivElement>(null)


		const handleSave = async (localHtml: string) => {
			setIsSaving(true);
			try {
				const response = await fetch(`/api/links/update?id=${shape.id}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ html: localHtml }),
				});

				if (!response.ok) {
					throw new Error('Failed to update HTML');
				}

				// Update the shape's props with the new HTML
				this.editor.updateShape<PreviewShape>({
					id: shape.id,
					type: 'preview',
					props: { ...shape.props, html: localHtml },
				});

				setHasChanges(false);
				toast.addToast({
					title: 'Changes saved',
					description: 'Your HTML has been updated successfully.',
				});
			} catch (error) {
				console.error('Error saving HTML:', error);
				toast.addToast({
					title: 'Error',
					description: 'Failed to save changes. Please try again.',
				});
			} finally {
				setIsSaving(false);
			}
		}

		useEffect(() => {
			// Update localHtml whenever shape.props.html changes
			setLocalHtml(shape.props.html);
		  }, [shape.props.html]);

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)
	
		// Kind of a hack—we're preventing user's from pinching-zooming into the iframe
		const htmlToUse = localHtml
			? localHtml.replace(
					`</body>`,
					`<script>document.body.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); return }, { passive: false })</script>
	</body>`
			  )
			: null

	
		return (
			<div ref={containerRef}>
				<HTMLContainer className="tl-embed-container" id={shape.id}>
					{htmlToUse ? (
						<iframe
							srcDoc={htmlToUse}
							width={toDomPrecision(shape.props.w)}
							height={toDomPrecision(shape.props.h)}
							draggable={false}
							style={{
								pointerEvents: isEditing ? 'auto' : 'none',
								boxShadow,
								border: '1px solid var(--color-panel-contrast)',
								borderRadius: 'var(--radius-2)',
							}}
						/>
					) : (
						<div
							style={{
								width: '100%',
								height: '100%',
								backgroundColor: 'var(--color-culled)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow,
								border: '1px solid var(--color-panel-contrast)',
								borderRadius: 'var(--radius-2)',
							}}
						>
							<DefaultSpinner />
						</div>
					)}

					{htmlToUse && (
						<button
							style={{
								all: 'unset',
								position: 'absolute',
								top: 0,
								right: -40,
								height: 40,
								width: 40,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								pointerEvents: 'all',
							}}
							onClick={() => setIsModalOpen(true)}
							onTouchStart={() => setIsModalOpen(true)}
							onPointerDown={stopEventPropagation}
							title="View code in editor"
						>
							<Icon icon="code" />
						</button>
					)}
					{htmlToUse && <UrlLinkButton shape={shape} />}
					{htmlToUse && (
						<div
							style={{
								textAlign: 'center',
								position: 'absolute',
								bottom: isEditing ? -40 : 0,
								padding: 4,
								fontFamily: 'inherit',
								fontSize: 12,
								left: 0,
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								pointerEvents: 'none',
							}}
						>
							<span
								style={{
									background: 'var(--color-panel)',
									padding: '4px 12px',
									borderRadius: 99,
									border: '1px solid var(--color-muted-1)',
								}}
							>
								{isEditing ? 'Click the canvas to exit' : 'Double click to interact'}
							</span>
						</div>
					)}
					<Modal
						isOpen={isModalOpen}
						onRequestClose={() => setIsModalOpen(false)}
						contentLabel="Code Editor"
						shouldCloseOnOverlayClick={false}
						appElement={containerRef.current}
						style={{
							overlay: {
								backdropFilter: 'none',
								background: 'transparent',
							},
							content: {
								position: 'absolute',
								top: '0',
								left: '0',
								right: '0',
								bottom: '0',
								padding: '0',
								background: 'transparent'
							},
						}}
					>
						<CodeEditorComponent
							localHtml={localHtml}
							setLocalHtml={setLocalHtml}
							handleSave={handleSave}
							closeModal={() => setIsModalOpen(false)}
						/>
					</Modal>
				</HTMLContainer>
			</div>
		)
	}

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

// todo: export these from tldraw

const ROTATING_BOX_SHADOWS = [
	{
		offsetX: 0,
		offsetY: 2,
		blur: 4,
		spread: -1,
		color: '#0000003a',
	},
	{
		offsetX: 0,
		offsetY: 3,
		blur: 12,
		spread: -2,
		color: '#0000001f',
	},
]

function getRotatedBoxShadow(rotation: number) {
	const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
		const { offsetX, offsetY, blur, spread, color } = shadow
		const vec = new Vec2d(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}